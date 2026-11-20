<?php

namespace Tests\Feature\Api;

use App\Models\InstanciaCoordinacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AreasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->autenticar('admin');
    }

    public function test_devuelve_el_arbol_organizacional_jerarquico(): void
    {
        $arbol = $this->getJson('/api/areas/arbol')->assertOk()->json('data');

        $this->assertCount(1, $arbol);
        $this->assertSame('DES', $arbol[0]['codigo']);

        $descendientes = collect($arbol[0]['hijos']);
        $areaA = $descendientes->firstWhere('codigo', 'GAA');

        $this->assertNotNull($areaA);
        $this->assertSame(
            'SIS',
            collect($areaA['hijos'])->firstWhere('codigo', 'SIS')['codigo'],
        );
    }

    public function test_el_arbol_respeta_el_alcance_del_encargado(): void
    {
        $this->autenticar('jefe_a');

        $arbol = $this->getJson('/api/areas/arbol')->assertOk()->json('data');

        $this->assertCount(1, $arbol);
        $this->assertSame('GAA', $arbol[0]['codigo']);
        $this->assertSame('SIS', collect($arbol[0]['hijos'])->firstWhere('codigo', 'SIS')['codigo']);
    }

    public function test_asigna_y_devuelve_el_responsable_del_area(): void
    {
        $responsable = User::query()->where('usuario', 'jefe_a')->firstOrFail();
        $area = InstanciaCoordinacion::query()->where('codigo', 'SIS')->firstOrFail();

        $datos = $this->putJson('/api/areas/'.$area->id, [
            'nombre' => $area->nombre,
            'responsable_id' => $responsable->id,
        ])->assertOk()->json('data');

        $this->assertSame($responsable->id, $datos['responsable_id']);
        $this->assertSame($responsable->id, $datos['responsable']['id']);
        $this->assertDatabaseHas('instancias_coordinacion', [
            'id' => $area->id,
            'responsable_id' => $responsable->id,
        ]);
    }

    public function test_normaliza_y_valida_el_codigo_y_el_responsable(): void
    {
        $creada = $this->postJson('/api/areas', [
            'codigo' => ' nueva ',
            'nombre' => 'Nueva área',
        ])->assertCreated()->json('data');

        $this->assertSame('NUEVA', $creada['codigo']);

        $this->postJson('/api/areas', [
            'codigo' => 'CODIGO CON ESPACIOS',
            'nombre' => 'Inválida',
        ])->assertStatus(422)->assertJsonValidationErrors('codigo');

        $this->postJson('/api/areas', [
            'codigo' => 'OTRA',
            'nombre' => 'Inválida',
            'responsable_id' => 999999,
        ])->assertStatus(422)->assertJsonValidationErrors('responsable_id');
    }

    public function test_no_desactiva_un_area_con_areas_hijas_activas(): void
    {
        $despacho = InstanciaCoordinacion::query()->where('codigo', 'DES')->firstOrFail();

        $this->deleteJson('/api/areas/'.$despacho->id)
            ->assertStatus(409)
            ->assertJsonPath('message', 'No se puede desactivar un área con áreas hijas activas.');

        $this->assertDatabaseHas('instancias_coordinacion', ['id' => $despacho->id, 'activo' => 1]);
    }

    public function test_recalcula_ruta_y_nivel_al_mover_un_area(): void
    {
        $despacho = InstanciaCoordinacion::query()->where('codigo', 'DES')->firstOrFail();
        $areaA = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();

        $movible = $this->postJson('/api/areas', [
            'codigo' => 'MOV',
            'nombre' => 'Movible',
            'padre_id' => $despacho->id,
        ])->assertCreated()->json('data');

        $hija = $this->postJson('/api/areas', [
            'codigo' => 'MOVH',
            'nombre' => 'Hija movible',
            'padre_id' => $movible['id'],
        ])->assertCreated()->json('data');

        $this->putJson('/api/areas/'.$movible['id'], [
            'nombre' => 'Movible',
            'padre_id' => $areaA->id,
        ])->assertOk();

        $this->assertDatabaseHas('instancias_coordinacion', [
            'id' => $hija['id'],
            'nivel' => 4,
            'ruta' => '/'.$despacho->id.'/'.$areaA->id.'/'.$movible['id'].'/'.$hija['id'].'/',
        ]);
    }

    public function test_rechaza_como_padre_un_area_inactiva(): void
    {
        $inactiva = $this->postJson('/api/areas', [
            'codigo' => 'INAC',
            'nombre' => 'Inactiva',
        ])->assertCreated()->json('data');

        $this->deleteJson('/api/areas/'.$inactiva['id'])->assertOk();

        $this->postJson('/api/areas', [
            'codigo' => 'Hija',
            'nombre' => 'Hija de inactiva',
            'padre_id' => $inactiva['id'],
        ])->assertStatus(422)->assertJsonValidationErrors('padre_id');
    }

    public function test_filtra_las_areas_por_tipo_y_estado(): void
    {
        $this->getJson('/api/areas?tipo=direccion')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.codigo', 'GAA');

        $this->getJson('/api/areas?activo=false')->assertOk()->assertJsonCount(0, 'data');
    }

    private function autenticar(string $usuario): void
    {
        $modelo = User::query()->where('usuario', $usuario)->firstOrFail();

        $this->withHeader('Authorization', 'Bearer '.$modelo->createToken('pruebas')->plainTextToken);
    }
}
