<?php

namespace App\Enums;

/**
 * Permission level of a company/establishment login, orthogonal to UserRole
 * (which only says the login is of type "company"/"establishment"). Scoped
 * per tenant — a Master in Company A has no special standing in Company B.
 */
enum TenantRole: string
{
    case Master = 'master';
    case Administrador = 'administrador';
    case Normal = 'normal';

    public function label(): string
    {
        return match ($this) {
            self::Master => 'Master',
            self::Administrador => 'Administrador',
            self::Normal => 'Usuário Normal',
        };
    }
}
