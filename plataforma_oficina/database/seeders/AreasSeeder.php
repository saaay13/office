<?php

namespace Database\Seeders;

use App\Actions\GuardarArea;
use App\Enums\TipoArea;
use App\Models\InstanciaCoordinacion;
use Illuminate\Database\Seeder;

class AreasSeeder extends Seeder
{
    public function __construct(private readonly GuardarArea $guardar)
    {
    }

    public function run(): void
    {
        $despacho = $this->area([
            'codigo' => 'DES',
            'nombre' => 'Despacho',
            'tipo' => TipoArea::Despacho->value,
        ]);

        $areaA = $this->area([
            'padre_id' => $despacho->id,
            'codigo' => 'GAA',
            'nombre' => 'Área A',
            'tipo' => TipoArea::Direccion->value,
            'email' => 'area.a@tarija.gob.bo',
        ]);

        $this->area([
            'padre_id' => $despacho->id,
            'codigo' => 'CDAB',
            'nombre' => 'Área B',
            'tipo' => TipoArea::Direccion->value,
            'email' => 'area.b@tarija.gob.bo',
        ]);

        $this->area([
            'padre_id' => $areaA->id,
            'codigo' => 'SIS',
            'nombre' => 'Sistemas',
            'tipo' => TipoArea::Unidad->value,
        ]);
    }

    private function area(array $datos): InstanciaCoordinacion
    {
        $existente = InstanciaCoordinacion::query()
            ->where('codigo', $datos['codigo'])
            ->first();

        return $this->guardar->execute($datos, $existente);
    }
}
