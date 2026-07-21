<?php

namespace App\Modules\Companies\Resources;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Company
 */
class CompanyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'master' => $this->whenLoaded('masterUser', fn () => $this->masterUser ? [
                'id' => $this->masterUser->id,
                'name' => $this->masterUser->name,
                'email' => $this->masterUser->email,
            ] : null),
            'legal_name' => $this->legal_name,
            'trade_name' => $this->trade_name,
            'cnpj' => $this->cnpj,
            'phone' => $this->phone,
            'contact_email' => $this->email,
            'cep' => $this->cep,
            'logradouro' => $this->logradouro,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'bairro' => $this->bairro,
            'city_id' => $this->city_id,
            'city' => $this->whenLoaded('city', fn () => [
                'id' => $this->city->id,
                'name' => $this->city->name,
                'uf' => $this->city->state->uf,
                'state_id' => $this->city->state_id,
            ]),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
