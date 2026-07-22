<?php

namespace App\Modules\Employees\Exceptions;

use RuntimeException;

/**
 * Thrown when an employee activation link is missing, malformed, expired, or
 * already consumed (the token is cleared from the user on activation).
 */
class ActivationTokenInvalidException extends RuntimeException
{
    public function __construct(string $message = 'Link de ativação inválido ou expirado.')
    {
        parent::__construct($message);
    }
}
