<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Immutable record of a benefit redemption. Name snapshots keep historical
 * reports stable even if the employee/company are later edited or soft-deleted.
 */
class BenefitUsage extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'employee_id',
        'company_id',
        'establishment_id',
        'validated_by_user_id',
        'used_at',
        'employee_name_snapshot',
        'company_name_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by_user_id');
    }
}
