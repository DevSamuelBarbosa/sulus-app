<?php

namespace App\Modules\Auth\Exceptions;

use RuntimeException;

/**
 * Thrown when a company/establishment login is valid but their business
 * profile has been deactivated by an admin. Rendered as a distinct response
 * so the frontend can route to a dedicated "account deactivated" screen
 * instead of showing a generic invalid-credentials error.
 */
class AccountInactiveException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Esta conta está desativada. Entre em contato com a Sulus para mais informações.');
    }
}
