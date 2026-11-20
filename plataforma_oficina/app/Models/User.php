<?php

namespace App\Models;

use App\Support\Permisos;
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

    public function esPersonal(): bool
    {
        return $this->rol?->clave === Permisos::ROL_PERSONAL;
    }

    public function esEncargado(): bool
    {
        return $this->rol?->clave === Permisos::ROL_ENCARGADO;
    }

    public function esAdminVista(): bool
    {
        return $this->rol?->clave === Permisos::ROL_ADMIN_VISTA;
    }

    public function esAdminGeneral(): bool
    {
        return $this->rol?->clave === Permisos::ROL_ADMIN_GENERAL;
    }

    public function areasAsignadas(): BelongsToMany
    {
        return $this->belongsToMany(
            InstanciaCoordinacion::class,
            'user_areas',
            'user_id',
            'area_id',
        )->wherePivot('activo', true);
    }

    /**
     * Areas adicionales asignadas. Lista vacía = sin asignaciones activas.
     *
     * @return list<int>
     */
    public function areasAsignadasIds(): array
    {
        return $this->areasAsignadas()
            ->pluck('instancias_coordinacion.id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function veArea(InstanciaCoordinacion $area): bool
    {
        if ($this->esAdminGeneral()) {
            return true;
        }

        if ($this->esAdminVista()) {
            $ids = $this->areasAsignadasIds();

            return $ids === []
                ? (int) $this->area_id === (int) $area->id
                : in_array((int) $area->id, $ids, true);
        }

        $propia = $this->area;

        if ($propia === null) {
            return false;
        }

        if ($propia->id === $area->id) {
            return true;
        }

        return $this->esEncargado()
            && str_starts_with((string) $area->ruta, (string) $propia->ruta);
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
