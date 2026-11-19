<?php

namespace App\Models;

use App\Enums\RolClave;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'rol_id',
        'area_id',
        'cargo_id',
        'nombres',
        'apellidos',
        'usuario',
        'email',
        'password',
        'telefono',
        'activo',
        'ultimo_acceso_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'ultimo_acceso_at' => 'datetime',
        'activo' => 'boolean',
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(InstanciaCoordinacion::class, 'area_id');
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }

    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class);
    }

    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'rol_permiso', 'rol_id', 'permiso_id', 'rol_id');
    }

    public function tienePermiso(string $clave): bool
    {
        $claves = once(fn (): array => $this->permisos()->where('activo', true)->pluck('clave')->all());

        return in_array($clave, $claves, true);
    }

    public function esAdmin(): bool
    {
        return $this->rol?->clave === RolClave::AdminInstitucional->value;
    }

    public function esJefeArea(): bool
    {
        return $this->rol?->clave === RolClave::JefeArea->value;
    }

    public function esDirectivo(): bool
    {
        return $this->rol?->clave === RolClave::Directivo->value;
    }

    public function esAuditor(): bool
    {
        return $this->rol?->clave === RolClave::Auditor->value;
    }

    public function veArea(InstanciaCoordinacion $area): bool
    {
        if ($this->esAdmin() || $this->esDirectivo() || $this->esAuditor()) {
            return true;
        }

        $propia = $this->area;

        if ($propia === null) {
            return false;
        }

        if ($propia->id === $area->id) {
            return true;
        }

        return $this->esJefeArea() && str_starts_with((string) $area->ruta, (string) $propia->ruta);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPassword($token));
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
