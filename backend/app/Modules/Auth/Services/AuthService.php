<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Exceptions\AccountInactiveException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Validate credentials and issue a Bearer token scoped to the user's role.
     *
     * @return array{token: string, user: User}
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        // See User::hasActiveProfile() — same check EnsureRole re-runs on
        // every subsequent request, so a tenant deactivated/deleted after
        // login can't keep using an already-issued token either.
        if (! $user->is_active || ! $user->hasActiveProfile()) {
            throw new AccountInactiveException;
        }

        $token = $user->createToken('pwa', $user->role->abilities())->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
