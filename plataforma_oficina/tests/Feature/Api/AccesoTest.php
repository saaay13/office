<?php

namespace Tests\Feature\Api;

use App\Models\InstanciaCoordinacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccesoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_el_funcionario_solo_ve_su_area(): void
    {
        $this->actuarComo('pa');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertSame(['GAA'], $nombres);
    }

    public function test_el_jefe_ve_su_area_y_sus_subarboles(): void
    {
        $this->actuarComo('jefe_a');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertContains('GAA', $nombres);
        $this->assertContains('SIS', $nombres);
        $this->assertNotContains('CDAB', $nombres);
        $this->assertNotContains('DES', $nombres);
    }

    public function test_el_administrador_ve_todas_las_areas(): void
    {
        $this->actuarComo('admin');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertContains('DES', $nombres);
        $this->assertContains('GAA', $nombres);
        $this->assertContains('CDAB', $nombres);
        $this->assertContains('SIS', $nombres);
    }

    public function test_un_funcionario_no_entra_al_panel_de_administracion(): void
    {
        $this->actuarComo('pa');

        $this->getJson('/api/usuarios')->assertForbidden();
        $this->getJson('/api/roles')->assertForbidden();
        $this->getJson('/api/permisos')->assertForbidden();
        $this->getJson('/api/cargos')->assertForbidden();
    }

    public function test_el_jefe_solo_administra_su_area(): void
    {
        $this->actuarComo('jefe_a');

        $this->postJson('/api/areas', [
            'nombre' => 'Área nueva',
            'codigo' => 'NUEVA',
        ])->assertForbidden();

        $areaA = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();
        $areaB = InstanciaCoordinacion::query()->where('codigo', 'CDAB')->firstOrFail();

        $this->putJson('/api/areas/'.$areaA->id, ['nombre' => 'Área A actualizada'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Área A actualizada');

        $this->putJson('/api/areas/'.$areaB->id, ['nombre' => 'Ilegal'])->assertForbidden();
    }

    public function test_la_opciones_no_expone_areas_ajenas(): void
    {
        $this->actuarComo('pa');

        $areas = collect($this->getJson('/api/opciones')->assertOk()->json('areas'))
            ->pluck('codigo')
            ->all();

        $this->assertSame(['GAA'], $areas);
    }

    public function test_el_perfil_se_actualiza_sin_cambiar_rol_ni_area(): void
    {
        $this->actuarComo('pa');

        $this->putJson('/api/perfil', [
            'nombres' => 'Personal',
            'apellidos' => 'A actualizado',
            'email' => 'pa@tarija.gob.bo',
            'telefono' => '70000000',
        ])->assertOk()->assertJsonPath('user.telefono', '70000000');
    }

    private function actuarComo(string $usuario): void
    {
        $modelo = User::query()->where('usuario', $usuario)->firstOrFail();

        $this->withHeader('Authorization', 'Bearer '.$modelo->createToken('pruebas')->plainTextToken);
    }
}
