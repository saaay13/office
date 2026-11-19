<?php

namespace App\Providers;

use App\Models\Cargo;
use App\Models\InstanciaCoordinacion;
use App\Models\Mensaje;
use App\Models\Permiso;
use App\Models\Registro;
use App\Models\Reunion;
use App\Models\Rol;
use App\Models\User;
use App\Policies\AreaPolicy;
use App\Policies\CargoPolicy;
use App\Policies\PermisoPolicy;
use App\Policies\RolPolicy;
use App\Policies\UserPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Relation::enforceMorphMap([
            'registro' => Registro::class,
            'reunion' => Reunion::class,
            'mensaje' => Mensaje::class,
            'usuario' => User::class,
        ]);

        Gate::policy(InstanciaCoordinacion::class, AreaPolicy::class);
        Gate::policy(Cargo::class, CargoPolicy::class);
        Gate::policy(Rol::class, RolPolicy::class);
        Gate::policy(Permiso::class, PermisoPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        ResetPassword::createUrlUsing(function (User $usuario, string $token): string {
            return rtrim((string) config('productividad.frontend_url'), '/')
                .'/restablecer-clave?token='.urlencode($token)
                .'&email='.urlencode($usuario->email);
        });

        ResetPassword::toMailUsing(function (User $usuario, string $token): MailMessage {
            $url = rtrim((string) config('productividad.frontend_url'), '/')
                .'/restablecer-clave?token='.urlencode($token)
                .'&email='.urlencode($usuario->email);

            return (new MailMessage)
                ->subject('Restablece tu contraseña')
                ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta.')
                ->action('Restablecer contraseña', $url)
                ->line('Este enlace vence en '.config('auth.passwords.users.expire').' minutos.')
                ->line('Si no solicitaste el cambio, ignora este mensaje.');
        });
    }
}
