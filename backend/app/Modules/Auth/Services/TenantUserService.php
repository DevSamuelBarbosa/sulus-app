<?php

namespace App\Modules\Auth\Services;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Manages the logins (Users) belonging to a Company/Establishment tenant —
 * used by both the admin panel (App\Modules\Admin) and tenant self-service
 * (App\Modules\Companies, App\Modules\Establishments). See App\Enums\TenantRole
 * for the permission levels this enforces.
 */
class TenantUserService
{
    public function list(Company|Establishment $tenant): Collection
    {
        return $tenant->users()
            ->orderByRaw("FIELD(tenant_role, 'master', 'administrador', 'normal')")
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Company|Establishment $tenant, array $data): User
    {
        return DB::transaction(function () use ($tenant, $data) {
            $tenant::query()->whereKey($tenant->id)->lockForUpdate()->first();

            // The very first login of a tenant is always its Master,
            // regardless of what was requested — a tenant can never end up
            // without one.
            $tenantRole = $tenant->users()->exists() ? TenantRole::from($data['tenant_role']) : TenantRole::Master;

            return User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $tenant instanceof Company ? UserRole::Company : UserRole::Establishment,
                'is_active' => true,
                'tenant_role' => $tenantRole,
                $tenant instanceof Company ? 'company_id' : 'establishment_id' => $tenant->id,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            if (($data['tenant_role'] ?? null) === TenantRole::Master->value && ! $user->isTenantMaster()) {
                $this->transferMastership($user);
            }

            $user->update(collect($data)->only(['name', 'email', 'tenant_role'])->all());

            return $user->fresh();
        });
    }

    public function remove(User $user): void
    {
        if ($user->isTenantMaster()) {
            throw ValidationException::withMessages([
                'user' => 'Não é possível remover o Master. Promova outro login antes de remover este.',
            ]);
        }

        $user->update(['is_active' => false]);
    }

    /**
     * Demotes the tenant's current Master to Administrador so $newMaster can
     * take over — a tenant has at most one Master at any time.
     */
    private function transferMastership(User $newMaster): void
    {
        $tenant = $newMaster->company ?? $newMaster->establishment;
        $tenant::query()->whereKey($tenant->id)->lockForUpdate()->first();

        $tenant->users()
            ->where('tenant_role', TenantRole::Master)
            ->update(['tenant_role' => TenantRole::Administrador]);
    }
}
