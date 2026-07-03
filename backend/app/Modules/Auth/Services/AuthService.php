<?php

namespace App\Modules\Auth\Services;

use App\Enums\UserRole;
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

        if (! $user->is_active || $this->profileIsDeactivated($user)) {
            throw new AccountInactiveException;
        }

        $token = $user->createToken('pwa', $user->role->abilities())->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }

    /**
     * Companies/establishments deactivated by the admin (business status,
     * distinct from the user's own is_active login flag) must not log in.
     */
    private function profileIsDeactivated(User $user): bool
    {
        if (! in_array($user->role, [UserRole::Company, UserRole::Establishment], true)) {
            return false;
        }

        return $user->profile()?->is_active === false;
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
