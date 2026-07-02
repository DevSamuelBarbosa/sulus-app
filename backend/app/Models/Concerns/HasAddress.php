<?php

namespace App\Models\Concerns;

use App\Models\City;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Shared address behaviour for entities that reference a canonical city
 * (companies, establishments). The concrete address columns live on each
 * table's migration; this trait only wires the canonical relationship.
 */
trait HasAddress
{
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
