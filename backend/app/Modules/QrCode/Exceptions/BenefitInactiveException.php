<?php

namespace App\Modules\QrCode\Exceptions;

use RuntimeException;

/**
 * Thrown when a QR token is generated or validated for an employee whose
 * benefit has been cancelled — cancellation must block generation immediately
 * and also block a token issued right before cancellation from validating.
 */
class BenefitInactiveException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Este funcionário não possui um benefício ativo.');
    }
}
