<?php

namespace App\Modules\Auth\Services;

use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Modules\Auth\Exceptions\PasswordResetTokenInvalidException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * "Forgot password" flow — same shape as EmployeeActivationService (hashed,
 * expiring, single-use token) but with a much shorter TTL and no
 * auto-login: the user is expected to log in again with the new password.
 */
class PasswordResetService
{
    private const TTL_HOURS = 1;

    /**
     * Silent on unknown e-mails — the caller always shows the same generic
     * message regardless, so this never reveals whether an account exists.
     */
    public function sendResetLink(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return;
        }

        $plainToken = Str::random(64);

        $user->update([
            'password_reset_token' => hash('sha256', $plainToken),
            'password_reset_expires_at' => now()->addHours(self::TTL_HOURS),
        ]);

        $resetUrl = rtrim(config('app.frontend_url'), '/').'/redefinir-senha?token='.$plainToken;

        Mail::to($user->email)->send(new PasswordResetMail($user->name, $resetUrl));
    }

    public function reset(string $token, string $password): void
    {
        $user = User::where('password_reset_token', hash('sha256', $token))
            ->where('password_reset_expires_at', '>', now())
            ->first();

        if (! $user) {
            throw new PasswordResetTokenInvalidException;
        }

        $user->update([
            'password' => $password,
            'password_reset_token' => null,
            'password_reset_expires_at' => null,
        ]);

        // A password reset is a good moment to kill every other session —
        // if the old password leaked, whoever had it loses access too.
        $user->tokens()->delete();
    }
}
