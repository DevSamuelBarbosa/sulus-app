<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
    ];

    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }

    public function company(): HasOne
    {
        return $this->hasOne(Company::class);
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    public function establishment(): HasOne
    {
        return $this->hasOne(Establishment::class);
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
}
