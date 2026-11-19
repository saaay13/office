<?php

namespace App\Http\Requests;

use App\Support\Permisos;
use App\Models\InstanciaCoordinacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $area = $this->route('area');

        return $area instanceof InstanciaCoordinacion
            ? $this->user()->can('update', $area)
            : $this->user()->can('create', InstanciaCoordinacion::class);
    }

    public function rules(): array
    {
        $id = $this->route('area')?->id;

        return [
            'padre_id' => ['nullable', 'integer', 'exists:instancias_coordinacion,id'],
            'codigo' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('instancias_coordinacion', 'codigo')->ignore($id),
            ],
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['nullable', Rule::in(Permisos::TIPOS_AREA)],
            'email' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
