<?php

namespace App\Http\Requests;

use App\Models\Permiso;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permiso = $this->route('permiso');

        return $permiso instanceof Permiso
            ? $this->user()->can('update', $permiso)
            : $this->user()->can('create', Permiso::class);
    }

    public function rules(): array
    {
        $permiso = $this->route('permiso');

        return [
            'clave' => [
                $permiso === null ? 'required' : 'sometimes',
                'string',
                'max:100',
                Rule::unique('permisos', 'clave')->ignore($permiso?->id),
            ],
            'nombre' => ['required', 'string', 'max:150'],
            'modulo' => ['required', 'string', 'max:50'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $permiso = $this->route('permiso');

            if ($permiso instanceof Permiso && $this->filled('clave') && $this->input('clave') !== $permiso->clave) {
                $validator->errors()->add('clave', 'La clave del permiso no se puede cambiar.');
            }
        });
    }
}
