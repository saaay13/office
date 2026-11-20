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

class StatusCatalogosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->autenticar('admin');
    }

    public function test_las_listas_muestran_solo_activos_y_la_papelera_muestra_eliminados(): void
    {
        $cargo = Cargo::query()->create(['nombre' => 'Cargo de prueba']);

        $this->getJson('/api/cargos')
            ->assertOk()
            ->assertJsonFragment(['nombre' => 'Cargo de prueba']);

        $this->deleteJson('/api/cargos/'.$cargo->id)->assertOk();

        $this->getJson('/api/cargos')
            ->assertOk()
            ->assertJsonMissing(['nombre' => 'Cargo de prueba']);

        $papelera = $this->getJson('/api/cargos?status=eliminado')
            ->assertOk()
            ->json('data');

        $this->assertSame($cargo->id, collect($papelera)->firstWhere('nombre', 'Cargo de prueba')['id']);
    }

    public function test_ciclo_de_estado_de_un_cargo(): void
    {
        $cargo = Cargo::query()->create(['nombre' => 'Cargo ciclado']);

        $this->postJson('/api/cargos/'.$cargo->id.'/desactivar')->assertOk();
        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'desactivado']);

        $this->postJson('/api/cargos/'.$cargo->id.'/activar')->assertOk();
        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'activo']);

        $this->deleteJson('/api/cargos/'.$cargo->id)->assertOk();
        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'eliminado']);

        $this->postJson('/api/cargos/'.$cargo->id.'/restaurar')->assertOk();
        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'desactivado']);

        $this->postJson('/api/cargos/'.$cargo->id.'/activar')->assertOk();
        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'activo']);
    }

    public function test_la_unicidad_ignora_los_registros_eliminados(): void
    {
        $cargo = Cargo::query()->create(['nombre' => 'Cargo duplicable']);
        $this->deleteJson('/api/cargos/'.$cargo->id)->assertOk();

        $this->postJson('/api/cargos', ['nombre' => 'Cargo duplicable'])->assertCreated();
        $this->assertSame(2, Cargo::query()->where('nombre', 'Cargo duplicable')->count());
    }

    public function test_no_elimina_un_cargo_con_usuarios_activos(): void
    {
        $cargo = Cargo::query()->create(['nombre' => 'Cargo con usuario']);
        $rol = Rol::query()->where('clave', Permisos::ROL_PERSONAL)->firstOrFail();
        $area = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();

        $this->postJson('/api/usuarios', [
            'rol_id' => $rol->id,
            'area_id' => $area->id,
            'cargo_id' => $cargo->id,
            'nombres' => 'Con',
            'apellidos' => 'Cargo',
            'usuario' => 'con_cargo',
            'email' => 'con_cargo@tarija.gob.bo',
            'password' => 'Clave12345!',
            'password_confirmation' => 'Clave12345!',
        ])->assertCreated();

        $this->deleteJson('/api/cargos/'.$cargo->id)
            ->assertStatus(409)
            ->assertJsonPath('message', 'No se puede eliminar un cargo con usuarios activos asignados.');

        $this->assertDatabaseHas('cargos', ['id' => $cargo->id, 'status' => 'activo']);
    }

    public function test_el_encargado_no_puede_eliminar_ni_restaurar_cargos(): void
    {
        $this->autenticar('jefe_a');

        $cargo = Cargo::query()->create(['nombre' => 'Cargo del encargado']);

        $this->postJson('/api/cargos/'.$cargo->id.'/desactivar')->assertForbidden();
        $this->deleteJson('/api/cargos/'.$cargo->id)->assertForbidden();
        $this->postJson('/api/cargos/'.$cargo->id.'/restaurar')->assertForbidden();
    }

    public function test_los_roles_del_sistema_no_se_pueden_eliminar(): void
    {
        $rol = Rol::query()->where('clave', Permisos::ROL_ADMIN_GENERAL)->firstOrFail();

        $this->deleteJson('/api/roles/'.$rol->id)
            ->assertStatus(409)
            ->assertJsonPath('message', 'Los roles del sistema no se pueden eliminar.');

        $this->assertDatabaseHas('roles', ['id' => $rol->id, 'status' => 'activo']);
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
