<?php

namespace App\Models;

use App\Models\Concerns\HasAddress;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasAddress, HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'legal_name',
        'trade_name',
        'cnpj',
        'phone',
        'email',
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

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function benefitUsages(): HasMany
    {
        return $this->hasMany(BenefitUsage::class);
    }
}
