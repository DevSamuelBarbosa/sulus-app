<?php

namespace App\Modules\Auth\Resources;

use App\Models\PersonalAccessToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class AuthUserResource extends JsonResource
{
    private bool $impersonatorOverridden = false;

    private ?User $impersonator = null;

    /**
     * Explicitly set the impersonator when $resource wasn't authenticated via
     * Sanctum in this request (e.g. right after ImpersonationService::start
     * issues a token for a user who never went through auth:sanctum here).
     */
    public function withImpersonator(?User $impersonator): static
    {
        $this->impersonatorOverridden = true;
        $this->impersonator = $impersonator;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'tenant_role' => $this->tenant_role?->value,
            'impersonated_by' => $this->impersonatedBy(),
        ];
    }

    /**
     * @return array{id: int, name: string}|null
     */
    private function impersonatedBy(): ?array
    {
        $impersonator = $this->impersonatorOverridden
            ? $this->impersonator
            : $this->resolveImpersonatorFromToken();

        return $impersonator ? ['id' => $impersonator->id, 'name' => $impersonator->name] : null;
    }

    private function resolveImpersonatorFromToken(): ?User
    {
        $token = $this->resource->currentAccessToken();

        if (! $token instanceof PersonalAccessToken || $token->impersonator_id === null) {
            return null;
        }

        return User::find($token->impersonator_id);
    }
}
