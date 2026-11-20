<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstanciaCoordinacion extends Model
{
    use HasFactory;

    protected $table = 'instancias_coordinacion';

    protected $fillable = [
        'padre_id',
        'codigo',
        'nombre',
        'tipo',
        'nivel',
        'ruta',
        'responsable_id',
        'email',
        'telefono',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'nivel' => 'integer',
    ];

    public function padre(): BelongsTo
    {
        return $this->belongsTo(self::class, 'padre_id');
    }

    public function hijos(): HasMany
    {
        return $this->hasMany(self::class, 'padre_id')->orderBy('nombre');
    }

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'area_id');
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public function scopeVisiblesPara(Builder $query, User $user): Builder
    {
        if ($user->esAdminGeneral()) {
            return $query;
        }

        if ($user->esAdminVista()) {
            $ids = $user->areasAsignadasIds();

            if ($ids !== []) {
                return $query->whereIn('id', $ids);
            }
        }

        $area = $user->area;

        if ($area === null) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->esEncargado()) {
            return $query->where(function (Builder $consulta) use ($area): void {
                $consulta->where('id', $area->id)
                    ->orWhere('ruta', 'like', $area->ruta.'%');
            });
        }

        return $query->where('id', $area->id);
    }
}
