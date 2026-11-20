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

    protected function prepareForValidation(): void
    {
        if ($this->filled('codigo')) {
            $this->merge([
                'codigo' => strtoupper(trim((string) $this->input('codigo'))),
            ]);
        }
    }

    public function rules(): array
    {
        $area = $this->route('area');
        $id = $area instanceof InstanciaCoordinacion ? $area->id : null;

        return [
            'padre_id' => [
                'nullable',
                'integer',
                Rule::exists('instancias_coordinacion', 'id')->where('activo', true),
            ],
            'codigo' => [
                ...($this->isMethod('POST') ? ['required'] : ['sometimes']),
                'string',
                'max:20',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('instancias_coordinacion', 'codigo')->ignore($id),
            ],
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['nullable', Rule::in(Permisos::TIPOS_AREA)],
            'responsable_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('activo', true),
            ],
            'email' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
