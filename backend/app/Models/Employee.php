<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'full_name',
        'cpf',
        'photo_path',
        'phone',
        'benefit_status',
        'hired_at',
    ];

    protected function casts(): array
    {
        return [
            'benefit_status' => EmployeeStatus::class,
            'hired_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function benefitUsages(): HasMany
    {
        return $this->hasMany(BenefitUsage::class);
    }

    public function hasActiveBenefit(): bool
    {
        return $this->benefit_status === EmployeeStatus::Active;
    }
}
