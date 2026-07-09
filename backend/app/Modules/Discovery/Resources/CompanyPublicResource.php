<?php

namespace App\Modules\Discovery\Resources;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-facing company profile for the establishment's partner-companies
 * directory. Deliberately minimal — no login user, CNPJ, or address detail,
 * just enough to identify who the establishment is partnered with.
 *
 * @mixin Company
 */
class CompanyPublicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'legal_name' => $this->legal_name,
            'trade_name' => $this->trade_name,
            'phone' => $this->phone,
            'logo_url' => $this->logoUrl(),
            'city' => $this->whenLoaded('city', fn () => [
                'id' => $this->city->id,
                'name' => $this->city->name,
                'uf' => $this->city->state->uf,
                'state_id' => $this->city->state_id,
            ]),
        ];
    }
}
