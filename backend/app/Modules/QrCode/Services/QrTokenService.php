<?php

namespace App\Modules\QrCode\Services;

use App\Models\Employee;
use App\Modules\QrCode\Exceptions\BenefitInactiveException;
use App\Modules\QrCode\Exceptions\QrTokenInvalidException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Generates and validates the opaque, short-lived QR token an employee shows
 * to redeem their benefit. The token itself never carries PII — it is a
 * random string mapped in the cache (Redis) to an employee id, with a TTL.
 *
 * The cache entry doubles as a small state machine (pending → validated →
 * used) instead of being deleted on validation: the employee's screen polls
 * `status()` by the same token to know when to stop refreshing and show a
 * "concluído" screen, so the token must still resolve to something readable
 * after it's been scanned. Single-use is enforced by the status transition
 * itself — validate() rejects anything that isn't still 'pending'.
 *
 * validate() also mints a short-lived "confirmation_ref", consumed exactly
 * once by BenefitService::registerUsage, so a usage can only be recorded off
 * the back of a real scan.
 */
class QrTokenService
{
    /**
     * @return array{token: string, expires_in: int}
     */
    public function generate(Employee $employee): array
    {
        if (! $employee->hasActiveBenefit()) {
            throw new BenefitInactiveException;
        }

        $token = Str::random((int) config('qrcode.token_length'));
        $ttl = (int) config('qrcode.ttl');

        Cache::put($this->tokenKey($token), ['employee_id' => $employee->id, 'status' => 'pending'], $ttl);

        return ['token' => $token, 'expires_in' => $ttl];
    }

    /**
     * @return array{employee: Employee, confirmation_ref: string, expires_in: int}
     */
    public function validate(string $token): array
    {
        $payload = Cache::get($this->tokenKey($token));

        if (! $payload || $payload['status'] !== 'pending') {
            throw new QrTokenInvalidException;
        }

        $employee = Employee::with('company')->find($payload['employee_id']);

        if (! $employee || ! $employee->hasActiveBenefit()) {
            throw new BenefitInactiveException;
        }

        $confirmationRef = Str::random((int) config('qrcode.token_length'));
        $confirmationTtl = (int) config('qrcode.confirmation_ttl');

        Cache::put($this->confirmationKey($confirmationRef), [
            'employee_id' => $employee->id,
            'token' => $token,
        ], $confirmationTtl);

        // Move the token to 'validated' (kept alive through the confirmation
        // window) instead of deleting it, so a replay attempt still finds it
        // and correctly fails on the status check above.
        Cache::put($this->tokenKey($token), ['employee_id' => $employee->id, 'status' => 'validated'], $confirmationTtl);

        return [
            'employee' => $employee,
            'confirmation_ref' => $confirmationRef,
            'expires_in' => $confirmationTtl,
        ];
    }

    /**
     * Consume a confirmation_ref, returning the employee id and original
     * token it was issued for. Deletes it so it cannot back a second usage
     * record.
     *
     * @return array{employee_id: int, token: string}
     */
    public function consumeConfirmation(string $confirmationRef): array
    {
        $payload = Cache::pull($this->confirmationKey($confirmationRef));

        if (! $payload) {
            throw new QrTokenInvalidException('Confirmação expirada — escaneie o QR Code novamente.');
        }

        return $payload;
    }

    /**
     * Marks the token 'used' once its usage has actually been registered, so
     * the employee's poll can pick up the terminal state. Kept alive briefly
     * afterwards purely so a slow poll still observes it before it falls out
     * of the cache naturally.
     */
    public function markUsed(string $token, int $employeeId): void
    {
        Cache::put(
            $this->tokenKey($token),
            ['employee_id' => $employeeId, 'status' => 'used'],
            (int) config('qrcode.confirmation_ttl'),
        );
    }

    /**
     * @return array{status: 'pending'|'validated'|'used'|'expired'}
     */
    public function status(string $token, int $employeeId): array
    {
        $payload = Cache::get($this->tokenKey($token));

        // Also covers the (impossible in normal use, but not IDOR-safe to
        // skip) case of polling another employee's token.
        if (! $payload || $payload['employee_id'] !== $employeeId) {
            return ['status' => 'expired'];
        }

        return ['status' => $payload['status']];
    }

    private function tokenKey(string $token): string
    {
        return config('qrcode.cache_prefix').':'.$token;
    }

    private function confirmationKey(string $ref): string
    {
        return config('qrcode.confirmation_prefix').':'.$ref;
    }
}
