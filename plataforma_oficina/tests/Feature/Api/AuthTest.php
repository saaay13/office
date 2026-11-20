<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_permite_ingresar_con_usuario_o_con_correo(): void
    {
        $porUsuario = $this->postJson('/api/auth/login', [
            'usuario' => 'pa',
            'password' => '123456',
        ])->assertOk()->assertJsonStructure(['user' => ['id', 'usuario'], 'token', 'permisos']);

        $token = $porUsuario->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.usuario', 'pa');

        $this->postJson('/api/auth/logout', [], ['Authorization' => 'Bearer '.$token])->assertOk();

        $this->postJson('/api/auth/login', [
            'usuario' => 'pa@tarija.gob.bo',
            'password' => '123456',
        ])->assertOk()->assertJsonPath('user.usuario', 'pa');
    }

    public function test_el_usuario_de_prueba_ingresa_con_su_correo_y_clave(): void
    {
        $this->postJson('/api/auth/login', [
            'usuario' => 'prueba@gmail.com',
            'password' => '123456',
        ])->assertOk()
            ->assertJsonPath('user.usuario', 'prueba')
            ->assertJsonStructure(['user' => ['id', 'usuario'], 'token', 'permisos']);
    }

    public function test_rechaza_credenciales_invalidas_y_usuario_inactivo(): void
    {
        $this->postJson('/api/auth/login', [
            'usuario' => 'pa',
            'password' => 'incorrecta',
        ])->assertStatus(422)->assertJsonValidationErrors('usuario');

        User::query()->where('usuario', 'pa')->update(['activo' => false]);

        $this->postJson('/api/auth/login', [
            'usuario' => 'pa',
            'password' => '123456',
        ])->assertStatus(422)->assertJsonValidationErrors('usuario');
    }

    public function test_un_token_de_usuario_inactivo_deja_de_ser_valido(): void
    {
        $token = $this->postJson('/api/auth/login', [
            'usuario' => 'pa',
            'password' => '123456',
        ])->assertOk()->json('token');

        User::query()->where('usuario', 'pa')->update(['activo' => false]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me')
            ->assertForbidden()
            ->assertJsonPath('message', 'El usuario está inactivo.');
    }

    public function test_recupera_y_restablece_la_contrasena(): void
    {
        $usuario = User::query()->where('usuario', 'pa')->firstOrFail();

        $this->postJson('/api/auth/forgot-password', ['email' => $usuario->email])
            ->assertOk()
            ->assertJsonPath('message', 'Si el correo está registrado, se envió un enlace para restablecer la contraseña.');

        $this->assertDatabaseHas('password_reset_tokens', ['email' => $usuario->email]);

        $token = Password::broker()->createToken($usuario);

        $this->postJson('/api/auth/reset-password', [
            'email' => $usuario->email,
            'token' => $token,
            'password' => 'NuevaClave123!',
            'password_confirmation' => 'NuevaClave123!',
        ])->assertOk();

        $this->assertTrue(Hash::check('NuevaClave123!', $usuario->fresh()->password));
    }

    public function test_rechaza_un_enlace_de_recuperacion_vencido(): void
    {
        $usuario = User::query()->where('usuario', 'pa')->firstOrFail();
        $token = Password::broker()->createToken($usuario);

        $this->travel(61)->minutes();

        $this->postJson('/api/auth/reset-password', [
            'email' => $usuario->email,
            'token' => $token,
            'password' => 'NuevaClave123!',
            'password_confirmation' => 'NuevaClave123!',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_la_recuperacion_no_revela_si_el_correo_existe(): void
    {
        $this->postJson('/api/auth/forgot-password', ['email' => 'noexiste@tarija.gob.bo'])
            ->assertOk()
            ->assertJsonPath('message', 'Si el correo está registrado, se envió un enlace para restablecer la contraseña.');
    }
}
