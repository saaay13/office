<?php

namespace Tests\Feature\Api;

use App\Models\InstanciaCoordinacion;
use App\Models\Permiso;
use App\Models\Rol;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GestionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->withHeader('Authorization', 'Bearer '.$this->admin()->createToken('pruebas')->plainTextToken);
    }

    public function test_crea_y_desactiva_un_cargo(): void
    {
        $creado = $this->postJson('/api/cargos', [
            'nombre' => 'Analista',
            'descripcion' => 'Analista de procesos',
        ])->assertCreated()->json('data');

        $this->assertDatabaseHas('cargos', ['id' => $creado['id'], 'activo' => 1]);

        $this->deleteJson('/api/cargos/'.$creado['id'])->assertOk();

        $this->assertDatabaseHas('cargos', ['id' => $creado['id'], 'activo' => 0]);
    }

    public function test_valida_la_unicidad_del_codigo_de_area(): void
    {
        $despacho = InstanciaCoordinacion::query()->where('codigo', 'DES')->firstOrFail();

        $this->postJson('/api/areas', [
            'padre_id' => $despacho->id,
            'codigo' => 'GAA',
            'nombre' => 'Duplicada',
        ])->assertStatus(422)->assertJsonValidationErrors('codigo');
    }

    public function test_no_permite_mover_un_area_debajo_de_su_descendiente(): void
    {
        $areaA = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();
        $sistemas = InstanciaCoordinacion::query()->where('codigo', 'SIS')->firstOrFail();

        $this->putJson('/api/areas/'.$areaA->id, [
            'padre_id' => $sistemas->id,
            'nombre' => $areaA->nombre,
        ])->assertStatus(422)->assertJsonValidationErrors('padre_id');
    }

    public function test_no_permite_cambiar_la_clave_de_un_area(): void
    {
        $areaA = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();

        $this->putJson('/api/areas/'.$areaA->id, [
            'codigo' => 'OTRO',
            'nombre' => $areaA->nombre,
        ])->assertStatus(422)->assertJsonValidationErrors('codigo');
    }

    public function test_sincroniza_los_permisos_de_un_rol(): void
    {
        $permisos = Permiso::query()->whereIn('clave', ['areas.ver', 'registros.crear'])->pluck('id')->all();

        $rol = $this->postJson('/api/roles', [
            'clave' => 'coordinador',
            'nombre' => 'Coordinador',
            'permisos' => $permisos,
        ])->assertCreated()->json('data');

        $claves = $rol['permisos'];
        sort($claves);

        $this->assertSame(['areas.ver', 'registros.crear'], $claves);

        $this->assertDatabaseHas('rol_permiso', ['rol_id' => $rol['id'], 'permiso_id' => $permisos[0]]);
        $this->assertDatabaseHas('rol_permiso', ['rol_id' => $rol['id'], 'permiso_id' => $permisos[1]]);
    }

    public function test_no_permite_modificar_los_permisos_del_administrador(): void
    {
        $admin = Rol::query()->where('clave', Permisos::ROL_ADMIN_GENERAL)->firstOrFail();

        $this->putJson('/api/roles/'.$admin->id, [
            'nombre' => $admin->nombre,
            'permisos' => [],
        ])->assertStatus(422)->assertJsonValidationErrors('permisos');
    }

    public function test_crea_un_usuario_y_lo_desactiva(): void
    {
        $rol = Rol::query()->where('clave', Permisos::ROL_PERSONAL)->firstOrFail();
        $area = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();

        $usuario = $this->postJson('/api/usuarios', [
            'rol_id' => $rol->id,
            'area_id' => $area->id,
            'nombres' => 'Nueva',
            'apellidos' => 'Funcionaria',
            'usuario' => 'nueva',
            'email' => 'nueva@tarija.gob.bo',
            'password' => 'Clave12345!',
            'password_confirmation' => 'Clave12345!',
        ])->assertCreated()->json('data');

        $this->assertDatabaseHas('users', ['id' => $usuario['id'], 'usuario' => 'nueva']);

        $this->deleteJson('/api/usuarios/'.$usuario['id'])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $usuario['id'], 'activo' => 0]);
    }

    private function admin(): User
    {
        return User::query()->where('usuario', 'admin')->firstOrFail();
    }
}
