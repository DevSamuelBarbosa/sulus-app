<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Company = 'company';
    case Employee = 'employee';
    case Establishment = 'establishment';

    /**
     * Sanctum token abilities granted to a user with this role.
     *
     * @return array<int, string>
     */
    public function abilities(): array
    {
        return match ($this) {
            self::Admin => ['*'],
            self::Company => ['company'],
            self::Employee => ['employee'],
            self::Establishment => ['establishment'],
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Company => 'Empresa',
            self::Employee => 'Funcionário',
            self::Establishment => 'Estabelecimento Parceiro',
        };
    }
}
