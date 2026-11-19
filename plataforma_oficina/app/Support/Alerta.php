<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class Alerta
{
    public const LABELS = [
        'sin_alerta' => 'Sin alerta',
        'finalizado' => 'Finalizado',
        'archivado' => 'Archivado',
        'cancelada' => 'Cancelada',
        'sin_fecha' => 'Sin fecha',
        'vencido' => 'Vencido',
        'por_vencer' => 'Por vencer',
        'en_plazo' => 'En plazo',
        'revisar_coordinacion' => 'Revisar coordinación',
        'por_coordinar' => 'Por coordinar',
        'revisar_cierre' => 'Revisar cierre',
        'proximo' => 'Próximo',
    ];

    public static function label(string $alerta): string
    {
        return self::LABELS[$alerta] ?? ucfirst(str_replace('_', ' ', $alerta));
    }

    /**
     * Alerta estándar según una fecha límite y un umbral de días.
     */
    public static function porFecha(Carbon|string $fecha, int $diasPorVencer): string
    {
        $hoy = Carbon::today();
        $limite = $fecha instanceof Carbon
            ? $fecha->copy()->startOfDay()
            : Carbon::parse($fecha)->startOfDay();

        if ($limite->lt($hoy)) {
            return 'vencido';
        }

        if ($limite->lte($hoy->copy()->addDays($diasPorVencer))) {
            return 'por_vencer';
        }

        return 'en_plazo';
    }
}
