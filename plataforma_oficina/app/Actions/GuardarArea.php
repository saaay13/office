<?php

namespace App\Actions;

use App\Models\InstanciaCoordinacion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GuardarArea
{
    public function execute(array $datos, ?InstanciaCoordinacion $area = null): InstanciaCoordinacion
    {
        return DB::transaction(function () use ($datos, $area): InstanciaCoordinacion {
            $esNueva = $area === null;
            $area ??= new InstanciaCoordinacion();

            $codigo = $datos['codigo'] ?? null;

            if (! $esNueva && $area->codigo !== null && $codigo !== null && $area->codigo !== $codigo) {
                throw ValidationException::withMessages([
                    'codigo' => 'El código del área no se puede cambiar una vez asignado.',
                ]);
            }

            $padre = $esNueva ? null : $area->padre;

            if (array_key_exists('padre_id', $datos)) {
                $padre = empty($datos['padre_id'])
                    ? null
                    : InstanciaCoordinacion::findOrFail($datos['padre_id']);
            }

            if ($padre !== null && ! $padre->activo) {
                throw ValidationException::withMessages([
                    'padre_id' => 'El área padre está inactiva.',
                ]);
            }

            if (! $esNueva && $padre !== null && ! $this->esMovimientoValido($area, $padre)) {
                throw ValidationException::withMessages([
                    'padre_id' => 'Un área no puede ser padre de sí misma ni de una de sus descendientes.',
                ]);
            }

            $area->fill($datos);
            $area->padre_id = $padre?->id;
            $area->nivel = $padre === null ? 1 : ($padre->nivel ?? 1) + 1;
            $area->ruta = '/';
            $area->save();

            $area->ruta = $padre === null
                ? '/'.$area->id.'/'
                : $this->rutaDelPadre($padre).$area->id.'/';
            $area->save();

            $this->actualizarRutasDescendientes($area);

            return $area->refresh()->load('padre', 'responsable');
        });
    }

    private function esMovimientoValido(InstanciaCoordinacion $area, InstanciaCoordinacion $padre): bool
    {
        if ($padre->id === $area->id) {
            return false;
        }

        $ruta = $area->ruta;

        return $ruta === null || ! str_starts_with($padre->ruta ?? '', $ruta);
    }

    private function actualizarRutasDescendientes(InstanciaCoordinacion $area): void
    {
        $hijos = InstanciaCoordinacion::query()->where('padre_id', $area->id)->get();

        foreach ($hijos as $hijo) {
            $hijo->nivel = ($area->nivel ?? 1) + 1;
            $hijo->ruta = $area->ruta.$hijo->id.'/';
            $hijo->save();

            $this->actualizarRutasDescendientes($hijo);
        }
    }

    private function rutaDelPadre(InstanciaCoordinacion $padre): string
    {
        if ($padre->ruta !== null && $padre->ruta !== '') {
            return $padre->ruta;
        }

        $ruta = '/';
        $actual = $padre;

        while ($actual !== null) {
            $ruta = '/'.$actual->id.$ruta;
            $actual = $actual->padre;
        }

        return $ruta;
    }
}
