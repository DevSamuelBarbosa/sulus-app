<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'city_id',
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

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function benefitUsages(): HasMany
    {
        return $this->hasMany(BenefitUsage::class);
    }

    public function hasActiveBenefit(): bool
    {
        return $this->benefit_status === EmployeeStatus::Active;
    }

    /**
     * Public/temporary URL for the employee photo, or null when unset.
     *
     * Private media on R2/S3 is served through a short-lived signed URL; on a
     * local ("public") disk we fall back to the regular public URL. R2 uses the
     * S3-compatible driver, so the check below covers it too.
     */
    public function photoUrl(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        $disk = config('media.disk');
        $storage = Storage::disk($disk);

        if (config("filesystems.disks.{$disk}.driver") === 's3') {
            return $storage->temporaryUrl(
                $this->photo_path,
                now()->addMinutes(config('media.signed_url_ttl')),
            );
        }

        return $storage->url($this->photo_path);
    }
}
