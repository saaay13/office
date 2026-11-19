<?php

namespace App\Http\Requests;

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
            'cargo_id' => ['nullable', 'integer', 'exists:cargos,id'],
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
}
