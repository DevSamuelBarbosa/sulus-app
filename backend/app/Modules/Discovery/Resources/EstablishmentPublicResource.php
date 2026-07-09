<?php

namespace App\Modules\Discovery\Resources;

use App\Models\Establishment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-facing establishment profile for the discovery directory (used by
 * company/employee search). Unlike Admin\EstablishmentResource, this never
 * exposes the login user or is_active — discovery only ever lists active
 * establishments in the first place.
 *
 * @mixin Establishment
 */
class EstablishmentPublicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'description' => $this->description,
            'phone' => $this->phone,
            'logo_url' => $this->logoUrl(),
            'logradouro' => $this->logradouro,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'bairro' => $this->bairro,
            'cep' => $this->cep,
            'city' => $this->whenLoaded('city', fn () => [
                'id' => $this->city->id,
                'name' => $this->city->name,
                'uf' => $this->city->state->uf,
                'state_id' => $this->city->state_id,
            ]),
        ];
    }
}
