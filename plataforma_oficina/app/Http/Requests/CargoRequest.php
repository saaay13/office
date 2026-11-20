<?php

namespace App\Http\Requests;

use App\Enums\StatusEntidad;
use App\Models\Cargo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class CargoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $cargo = $this->route('cargo');

        return $cargo instanceof Cargo
            ? $this->user()->can('update', $cargo)
            : $this->user()->can('create', Cargo::class);
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('nombre')) {
            $this->merge([
                'nombre' => preg_replace('/\s+/u', ' ', trim((string) $this->input('nombre'))),
            ]);
        }

        if ($this->exists('descripcion')) {
            $descripcion = trim((string) $this->input('descripcion'));

            $this->merge([
                'descripcion' => $descripcion === ''
                    ? null
                    : preg_replace('/\s+/u', ' ', $descripcion),
            ]);
        }
    }

    public function rules(): array
    {
        $cargo = $this->route('cargo');
        $id = $cargo instanceof Cargo ? $cargo->id : null;

        return [
            'nombre' => [
                'required',
                'string',
                'max:150',
                function (string $attribute, mixed $value, $fail) use ($id): void {
                    $nombre = Str::lower((string) $value);

                    $duplicado = Cargo::query()
                        ->where('status', '!=', StatusEntidad::Eliminado->value)
                        ->when($id !== null, fn ($consulta) => $consulta->whereKeyNot($id))
                        ->get(['id', 'nombre'])
                        ->contains(fn (Cargo $registro): bool => Str::lower($registro->nombre) === $nombre);

                    if ($duplicado) {
                        $fail('El nombre del cargo ya está registrado.');
                    }
                },
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'status' => [
                'sometimes',
                function (string $attribute, mixed $value, $fail): void {
                    $fail('El estado del cargo no se puede cambiar desde este formulario.');
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del cargo es obligatorio.',
            'nombre.string' => 'El nombre del cargo debe ser texto.',
            'nombre.max' => 'El nombre del cargo no puede superar los 150 caracteres.',
            'descripcion.string' => 'La descripción debe ser texto.',
            'descripcion.max' => 'La descripción no puede superar los 255 caracteres.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre del cargo',
            'descripcion' => 'descripción',
        ];
    }
}
