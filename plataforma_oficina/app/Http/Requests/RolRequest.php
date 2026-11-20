<?php

namespace App\Http\Requests;

use App\Enums\StatusEntidad;
use App\Models\Rol;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $rol = $this->route('rol');

        return $rol instanceof Rol
            ? $this->user()->can('update', $rol)
            : $this->user()->can('create', Rol::class);
    }

    public function rules(): array
    {
        $rol = $this->route('rol');

        return [
            'clave' => [
                $rol === null ? 'required' : 'sometimes',
                'string',
                'max:50',
                Rule::unique('roles', 'clave')
                    ->where(fn ($consulta) => $consulta->where('status', '!=', StatusEntidad::Eliminado->value))
                    ->ignore($rol?->id),
            ],
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'status' => [
                'sometimes',
                function (string $attribute, mixed $value, $fail): void {
                    $fail('El estado del rol no se puede cambiar desde este formulario.');
                },
            ],
            'permisos' => ['sometimes', 'array'],
            'permisos.*' => [
                'integer',
                Rule::exists('permisos', 'id')->where('status', StatusEntidad::Activo->value),
            ],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $rol = $this->route('rol');

            if ($rol instanceof Rol && $this->filled('clave') && $this->input('clave') !== $rol->clave) {
                $validator->errors()->add('clave', 'La clave del rol no se puede cambiar.');
            }
        });
    }
}
