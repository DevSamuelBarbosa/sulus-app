<?php

namespace App\Models;

use App\Models\Concerns\HasAddress;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Establishment extends Model
{
    use HasAddress, HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'cnpj',
        'description',
        'phone',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
        'city_id',
        'latitude',
        'longitude',
        'logo_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function benefitUsages(): HasMany
    {
        return $this->hasMany(BenefitUsage::class);
    }
}
