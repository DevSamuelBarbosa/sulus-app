<?php

namespace App\Models;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'company_id',
        'establishment_id',
        'tenant_role',
        'activation_token',
        'activation_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'activation_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'tenant_role' => TenantRole::class,
            'activation_expires_at' => 'datetime',
        ];
    }

    /**
     * The tenant this login belongs to (role=company). Multiple users can
     * share the same company_id, each with their own tenant_role.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * The tenant this login belongs to (role=establishment). See company().
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * Resolve the profile model tied to this user's role (null for admin).
     */
    public function profile(): ?Model
    {
        return match ($this->role) {
            UserRole::Company => $this->company,
            UserRole::Employee => $this->employee,
            UserRole::Establishment => $this->establishment,
            default => null,
        };
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    public function isTenantMaster(): bool
    {
        return $this->tenant_role === TenantRole::Master;
    }
}
