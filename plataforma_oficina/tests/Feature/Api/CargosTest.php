<?php

namespace Tests\Feature\Api;

use App\Models\Cargo;
use App\Models\InstanciaCoordinacion;
use App\Models\Rol;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Once;
use Tests\TestCase;

class CargosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->autenticar('admin');
    }

    public function test_consultay_filtra_los_cargos(): void
    {
        $cargos = $this->getJson('/api/cargos?q=direc')
            ->assertOk()
            ->json('data');

        $nombres = collect($cargos)->pluck('nombre')->all();

        $this->assertContains('Director', $nombres);
        $this->assertNotContains('Técnico', $nombres);

        $secretario = Cargo::query()->where('nombre', 'Secretario')->firstOrFail();
        $this->deleteJson('/api/cargos/'.$secretario->id)->assertOk();

        $eliminados = $this->getJson('/api/cargos?status=eliminado')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $eliminados);
        $this->assertSame('Secretario', $eliminados[0]['nombre']);
    }

    public function test_normaliza_el_nombre_y_valida_unicidad_al_crear_y_editar(): void
    {
        $creado = $this->postJson('/api/cargos', [
            'nombre' => '  Auditor   interno  ',
            'descripcion' => '  Revisión   de procesos  ',
        ])->assertCreated()->json('data');

        $this->assertSame('Auditor interno', $creado['nombre']);
        $this->assertSame('Revisión de procesos', $creado['descripcion']);

        $this->postJson('/api/cargos', [
            'nombre' => ' auditor   interno ',
        ])->assertStatus(422)->assertJsonValidationErrors('nombre');

        $this->putJson('/api/cargos/'.$creado['id'], [
            'nombre' => 'DIRECTOR',
        ])->assertStatus(422)->assertJsonValidationErrors('nombre');

        $this->putJson('/api/cargos/'.$creado['id'], [
            'nombre' => 'Auditor interno',
        ])->assertOk()->assertJsonPath('data.nombre', 'Auditor interno');
    }

    public function test_edita_y_elimina_un_cargo(): void
    {
        $cargo = Cargo::query()->create(['nombre' => 'Analista temporal']);

        $this->putJson('/api/cargos/'.$cargo->id, [
            'nombre' => 'Analista de soporte',
            'descripcion' => 'Soporte institucional',
        ])->assertOk()
            ->assertJsonPath('data.nombre', 'Analista de soporte')
            ->assertJsonPath('data.descripcion', 'Soporte institucional');

        $this->deleteJson('/api/cargos/'.$cargo->id)->assertOk();

        $this->assertDatabaseHas('cargos', [
            'id' => $cargo->id,
            'status' => 'eliminado',
            'nombre' => 'Analista de soporte',
        ]);
    }

    public function test_no_permite_reactivar_un_cargo_desde_la_edicion(): void
    {
        $cargo = Cargo::query()->where('nombre', 'Secretario')->firstOrFail();

        $this->deleteJson('/api/cargos/'.$cargo->id)->assertOk();

        $this->putJson('/api/cargos/'.$cargo->id, [
            'nombre' => $cargo->nombre,
            'status' => 'activo',
        ])->assertStatus(422)->assertJsonValidationErrors('status');

        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'eliminado']);
    }

    public function test_asocia_cargos_y_rechaza_cargos_inactivos_o_eliminados(): void
    {
        $rol = Rol::query()->where('clave', Permisos::ROL_PERSONAL)->firstOrFail();
        $area = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();

        $cargoAsignado = Cargo::query()->create(['nombre' => 'Analista de pruebas']);
        $cargoEliminado = Cargo::query()->create(['nombre' => 'Auditoría de pruebas']);
        $this->deleteJson('/api/cargos/'.$cargoEliminado->id)->assertOk();

        $usuario = $this->postJson('/api/usuarios', [
            'rol_id' => $rol->id,
            'area_id' => $area->id,
            'cargo_id' => $cargoAsignado->id,
            'nombres' => 'Cargo',
            'apellidos' => 'Asociado',
            'usuario' => 'cargo_asociado',
            'email' => 'cargo_asociado@tarija.gob.bo',
            'password' => 'Clave12345!',
            'password_confirmation' => 'Clave12345!',
        ])->assertCreated()->json('data');

        $datosEdicion = [
            'rol_id' => $rol->id,
            'area_id' => $area->id,
            'cargo_id' => $cargoAsignado->id,
            'nombres' => 'Cargo',
            'apellidos' => 'Asociado',
            'email' => 'cargo_asociado@tarija.gob.bo',
        ];

        $this->postJson('/api/cargos/'.$cargoAsignado->id.'/desactivar')->assertOk();

        $this->putJson('/api/usuarios/'.$usuario['id'], $datosEdicion)
            ->assertOk()
            ->assertJsonPath('data.cargo_id', $cargoAsignado->id);

        $this->putJson('/api/usuarios/'.$usuario['id'], [
            ...$datosEdicion,
            'cargo_id' => $cargoEliminado->id,
        ])->assertStatus(422)->assertJsonValidationErrors('cargo_id');

        $this->putJson('/api/usuarios/'.$usuario['id'], [
            ...$datosEdicion,
            'cargo_id' => null,
        ])->assertOk()->assertJsonPath('data.cargo_id', null);

        $this->deleteJson('/api/cargos/'.$cargoAsignado->id)->assertOk();

        $this->putJson('/api/usuarios/'.$usuario['id'], $datosEdicion)
            ->assertStatus(422)
            ->assertJsonValidationErrors('cargo_id');
    }

    public function test_los_permisos_de_cargos_se_resetan_por_rol(): void
    {
        $this->autenticar('jefe_a');

        $this->getJson('/api/cargos')->assertOk();
        $this->postJson('/api/cargos', ['nombre' => 'Cargo no permitido'])->assertForbidden();

        $this->autenticar('pa');

        $this->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.usuario', 'pa');

        $this->getJson('/api/cargos')->assertForbidden();
    }

    private function autenticar(string $usuario): void
    {
        $modelo = User::query()->where('usuario', $usuario)->firstOrFail();

        $this->withoutHeader('Authorization');
        Auth::forgetGuards();
        Once::flush();
        $this->withHeader('Authorization', 'Bearer '.$modelo->createToken('pruebas')->plainTextToken);
    }
}
