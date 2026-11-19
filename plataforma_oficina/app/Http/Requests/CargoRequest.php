<?php

namespace App\Http\Requests;

use App\Models\Cargo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CargoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $cargo = $this->route('cargo');

        return $cargo instanceof Cargo
            ? $this->user()->can('update', $cargo)
            : $this->user()->can('create', Cargo::class);
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:150',
                Rule::unique('cargos', 'nombre')->ignore($this->route('cargo')?->id),
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
