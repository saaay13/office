<?php

namespace App\Http\Requests;

use App\Models\Cargo;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $usuario = $this->route('usuario');

        return $usuario instanceof User
            ? $this->user()->can('update', $usuario)
            : $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        $usuario = $this->route('usuario');
        $id = $usuario?->id;

        return [
            'rol_id' => ['required', 'integer', 'exists:roles,id'],
            'area_id' => ['required', 'integer', 'exists:instancias_coordinacion,id'],
            'cargo_id' => [
                'nullable',
                'integer',
                function (string $attribute, mixed $value, $fail) use ($usuario): void {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $cargo = Cargo::query()->find($value);

                    if ($cargo === null) {
                        $fail('El cargo seleccionado no existe.');

                        return;
                    }

                    $sinCambio = $usuario instanceof User
                        && (int) $usuario->cargo_id === (int) $value;

                    if (! $cargo->activo && ! $sinCambio) {
                        $fail('No se puede asignar un cargo inactivo.');
                    }
                },
            ],
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'usuario' => [
                $usuario === null ? 'required' : 'sometimes',
                'string',
                'max:50',
                Rule::unique('users', 'usuario')->ignore($id),
            ],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($id),
            ],
            'telefono' => ['nullable', 'string', 'max:30'],
            'password' => [
                $usuario === null ? 'required' : 'sometimes',
                'string',
                'min:8',
                'confirmed',
            ],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'cargo_id.integer' => 'El cargo seleccionado no es válido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'cargo_id' => 'cargo',
        ];
    }
}
