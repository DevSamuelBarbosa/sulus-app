<?php

namespace App\Modules\Establishments\Resources;

use App\Models\Establishment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Establishment
 */
class EstablishmentResource extends JsonResource
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
            'name' => $this->name,
            'cnpj' => $this->cnpj,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'description' => $this->description,
            'phone' => $this->phone,
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
