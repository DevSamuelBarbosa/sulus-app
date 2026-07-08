<?php

namespace App\Modules\QrCode\Exceptions;

use RuntimeException;

/**
 * Thrown when a QR token or confirmation reference is missing, expired, or
 * already consumed. The cache entry is deleted on first read (see
 * QrTokenService), so a replayed token always lands here — this is what
 * guarantees single use.
 */
class QrTokenInvalidException extends RuntimeException
{
    public function __construct(string $message = 'QR Code inválido ou expirado.')
    {
        parent::__construct($message);
    }
}
