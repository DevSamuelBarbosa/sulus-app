<?php

namespace App\Modules\Localization\Resources;

use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin City */
class CityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ibge_code' => $this->ibge_code,
            'state_id' => $this->state_id,
            'uf' => $this->whenLoaded('state', fn () => $this->state->uf),
            'name' => $this->name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
