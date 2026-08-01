<?php

namespace App\Modules\Companies\Exceptions;

use RuntimeException;

/**
 * Thrown when a company self-registration link is missing, malformed,
 * expired, or points at an inactive company.
 */
class SelfRegistrationTokenInvalidException extends RuntimeException
{
    public function __construct(string $message = 'Link de cadastro inválido ou expirado.')
    {
        parent::__construct($message);
    }
}
