<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'ibge_code',
        'state_id',
        'name',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }
}
