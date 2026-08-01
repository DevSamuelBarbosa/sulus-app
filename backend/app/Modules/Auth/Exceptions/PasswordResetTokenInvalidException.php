<?php

namespace App\Modules\Auth\Exceptions;

use RuntimeException;

/**
 * Thrown when a password reset link is missing, malformed, expired, or
 * already consumed (the token is cleared from the user once used).
 */
class PasswordResetTokenInvalidException extends RuntimeException
{
    public function __construct(string $message = 'Link de redefinição de senha inválido ou expirado.')
    {
        parent::__construct($message);
    }
}
