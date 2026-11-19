<?php

namespace Tests\Feature;

use Illuminate\Database\Eloquent\Relations\Relation;
use Tests\TestCase;

class FundacionesTest extends TestCase
{
    public function test_hoy_usa_la_zona_horaria_de_negocio(): void
    {
        $this->assertSame('America/La_Paz', hoy()->timezoneName);
    }

    public function test_morph_map_esta_definido(): void
    {
        $map = Relation::morphMap();

        $this->assertArrayHasKey('registro', $map);
        $this->assertArrayHasKey('reunion', $map);
        $this->assertArrayHasKey('mensaje', $map);
    }
}
