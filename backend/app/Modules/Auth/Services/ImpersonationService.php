<?php

namespace App\Modules\Auth\Services;

use App\Enums\UserRole;
use App\Models\PersonalAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ImpersonationService
{
    /**
     * Issue an impersonation token for $target on behalf of $admin.
     *
     * @return array{token: string, user: User}
     */
    public function start(User $admin, User $target): array
    {
        if (! in_array($target->role, [UserRole::Company, UserRole::Establishment], true)) {
            abort(422, 'Só é possível impersonar empresas ou estabelecimentos.');
        }

        $newToken = $target->createToken('impersonation', $target->role->abilities());

        /** @var PersonalAccessToken $accessToken */
        $accessToken = $newToken->accessToken;
        $accessToken->forceFill(['impersonator_id' => $admin->id])->save();

        Log::info('Impersonation started', [
            'admin_id' => $admin->id,
            'target_user_id' => $target->id,
            'target_role' => $target->role->value,
        ]);

        return ['token' => $newToken->plainTextToken, 'user' => $target];
    }

    /**
     * Revoke the current impersonation token and issue a fresh admin token.
     *
     * @return array{token: string, user: User}
     */
    public function stop(User $impersonatedUser): array
    {
        /** @var PersonalAccessToken|null $currentToken */
        $currentToken = $impersonatedUser->currentAccessToken();

        if (! $currentToken instanceof PersonalAccessToken || $currentToken->impersonator_id === null) {
            abort(403, 'Esta sessão não é uma impersonação.');
        }

        $admin = User::findOrFail($currentToken->impersonator_id);

        $currentToken->delete();

        $newToken = $admin->createToken('pwa', $admin->role->abilities())->plainTextToken;

        Log::info('Impersonation stopped', [
            'admin_id' => $admin->id,
            'target_user_id' => $impersonatedUser->id,
        ]);

        return ['token' => $newToken, 'user' => $admin];
    }
}
