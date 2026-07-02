<?php

namespace App\Enums;

enum EmployeeStatus: string
{
    case Active = 'active';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativo',
            self::Cancelled => 'Cancelado',
        };
    }
}
