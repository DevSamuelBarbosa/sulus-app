<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

/**
 * Extends Sanctum's token model to add impersonator_id (the admin who issued
 * an impersonation token), which Sanctum's default $fillable doesn't cover.
 */
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    protected $fillable = [
        'name',
        'token',
        'abilities',
        'expires_at',
        'impersonator_id',
    ];
}
