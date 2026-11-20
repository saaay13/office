<?php

namespace App\Models;

use App\Enums\StatusEntidad;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cargo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'status',
    ];

    protected $casts = [
        'status' => StatusEntidad::class,
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
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
