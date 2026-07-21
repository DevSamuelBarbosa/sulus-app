<?php

namespace App\Modules\Auth\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A company/establishment login, as seen from tenant-user management screens
 * (admin or self-service). Distinct from AuthUserResource, which represents
 * "the currently authenticated session".
 *
 * @mixin User
 */
class TenantUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'tenant_role' => $this->tenant_role?->value,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
