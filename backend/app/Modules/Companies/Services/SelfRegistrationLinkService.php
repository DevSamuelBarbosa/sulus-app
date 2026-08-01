<?php

namespace App\Modules\Companies\Services;

use App\Models\Company;
use Illuminate\Support\Str;

/**
 * Authenticated (Master/Administrador) management of a company's
 * self-registration link — see SelfRegistrationService for the public side
 * that resolves and consumes it.
 */
class SelfRegistrationLinkService
{
    private const TTL_DAYS = 7;

    public function generate(Company $company): Company
    {
        $company->update([
            'self_registration_token' => Str::random(64),
            'self_registration_token_expires_at' => now()->addDays(self::TTL_DAYS),
        ]);

        return $company;
    }

    public function revoke(Company $company): Company
    {
        $company->update([
            'self_registration_token' => null,
            'self_registration_token_expires_at' => null,
        ]);

        return $company;
    }
}
