<?php

namespace App\Models;

use App\Enums\StatusEntidad;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permiso extends Model
{
    use HasFactory;

    protected $fillable = [
        'clave',
        'nombre',
        'modulo',
        'descripcion',
        'status',
    ];

    protected $casts = [
        'status' => StatusEntidad::class,
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Rol::class, 'rol_permiso', 'permiso_id', 'rol_id');
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('status', StatusEntidad::Activo->value);
    }

    public function scopeDesactivados(Builder $query): Builder
    {
        return $query->where('status', StatusEntidad::Desactivado->value);
    }

    public function scopeEliminados(Builder $query): Builder
    {
        return $query->where('status', StatusEntidad::Eliminado->value);
    }

    public function scopeNoEliminados(Builder $query): Builder
    {
        return $query->where('status', '!=', StatusEntidad::Eliminado->value);
    }
}
