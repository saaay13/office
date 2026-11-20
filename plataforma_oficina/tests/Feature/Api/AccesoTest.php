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

    public function test_el_personal_solo_ve_su_area(): void
    {
        $this->actuarComo('pa');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertSame(['GAA'], $nombres);
    }

    public function test_el_encargado_ve_su_area_y_sus_subarboles(): void
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

    public function test_el_admin_vista_solo_ve_las_areas_de_user_areas(): void
    {
        $this->actuarComo('vista');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertContains('GAA', $nombres);
        $this->assertContains('CDAB', $nombres);
        $this->assertNotContains('DES', $nombres);
        $this->assertNotContains('SIS', $nombres);
        $this->assertNotContains('PRUEBA', $nombres);
    }

    public function test_el_admin_vista_sin_asignaciones_usa_su_area_principal(): void
    {
        $vista = User::query()->where('usuario', 'vista')->firstOrFail();
        $vista->areasAsignadas()->detach();

        $this->actuarComo('vista');

        $nombres = collect($this->getJson('/api/areas')->assertOk()->json('data'))
            ->pluck('codigo')
            ->all();

        $this->assertSame(['DES'], $nombres);
    }

    public function test_el_admin_vista_es_solo_lectura(): void
    {
        $this->actuarComo('vista');

        $this->getJson('/api/usuarios')->assertOk();
        $this->getJson('/api/areas')->assertOk();

        $this->postJson('/api/areas', [
            'nombre' => 'Área nueva',
            'codigo' => 'NUEVA',
        ])->assertForbidden();

        $this->postJson('/api/usuarios', [
            'rol_id' => 1,
            'area_id' => 1,
            'nombres' => 'Nueva',
            'apellidos' => 'Usuaria',
            'usuario' => 'nueva_vista',
            'email' => 'nueva_vista@tarija.gob.bo',
            'password' => 'Clave12345!',
            'password_confirmation' => 'Clave12345!',
        ])->assertForbidden();
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

    public function test_un_personal_no_entra_al_panel_de_administracion(): void
    {
        $this->actuarComo('pa');

        $this->getJson('/api/usuarios')->assertForbidden();
        $this->getJson('/api/roles')->assertForbidden();
        $this->getJson('/api/permisos')->assertForbidden();
        $this->getJson('/api/cargos')->assertForbidden();
    }

    public function test_el_encargado_no_administra_areas(): void
    {
        $this->actuarComo('jefe_a');

        $this->postJson('/api/areas', [
            'nombre' => 'Área nueva',
            'codigo' => 'NUEVA',
        ])->assertForbidden();

        $areaA = InstanciaCoordinacion::query()->where('codigo', 'GAA')->firstOrFail();
        $areaB = InstanciaCoordinacion::query()->where('codigo', 'CDAB')->firstOrFail();

        $this->putJson('/api/areas/'.$areaA->id, ['nombre' => 'Ilegal'])->assertForbidden();
        $this->putJson('/api/areas/'.$areaB->id, ['nombre' => 'Ilegal'])->assertForbidden();
    }

    public function test_el_admin_general_administra_cualquier_area(): void
    {
        $this->actuarComo('admin');

        $area = InstanciaCoordinacion::query()->where('codigo', 'PRUEBA')->firstOrFail();

        $this->putJson('/api/areas/'.$area->id, ['nombre' => 'Prueba actualizada'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Prueba actualizada');
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
