<?php

namespace App\Modules\Employees\Services;

use App\Mail\EmployeeInviteMail;
use App\Models\User;
use App\Modules\Employees\Exceptions\ActivationTokenInvalidException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Employee logins are created without a password (see EmployeeService::create)
 * and activated by the employee themselves through a signed, single-use,
 * expiring link — the login stays is_active=false until then.
 */
class EmployeeActivationService
{
    private const TTL_DAYS = 7;

    public function sendInvite(User $employeeUser, string $companyName): void
    {
        $plainToken = Str::random(64);

        $employeeUser->update([
            'activation_token' => hash('sha256', $plainToken),
            'activation_expires_at' => now()->addDays(self::TTL_DAYS),
        ]);

        $activationUrl = rtrim(config('app.frontend_url'), '/').'/ativar-conta?token='.$plainToken;

        Mail::to($employeeUser->email)->send(
            new EmployeeInviteMail($employeeUser->name, $companyName, $activationUrl),
        );
    }

    /**
     * @return array{name: string, email: string}
     */
    public function inspect(string $token): array
    {
        $user = $this->resolve($token);

        return ['name' => $user->name, 'email' => $user->email];
    }

    public function activate(string $token, string $password): User
    {
        $user = $this->resolve($token);

        $user->update([
            'password' => $password,
            'is_active' => true,
            'activation_token' => null,
            'activation_expires_at' => null,
        ]);

        return $user;
    }

    private function resolve(string $token): User
    {
        $user = User::where('activation_token', hash('sha256', $token))
            ->where('activation_expires_at', '>', now())
            ->first();

        if (! $user) {
            throw new ActivationTokenInvalidException;
        }

        return $user;
    }
}
