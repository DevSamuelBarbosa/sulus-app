<?php

namespace App\Modules\Establishments\Services;

use App\Models\Establishment;

class EstablishmentService
{
    /**
     * Creates only the establishment profile — logins are created separately
     * via App\Modules\Auth\Services\TenantUserService (the first one created
     * becomes the tenant's Master automatically).
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Establishment
    {
        return Establishment::create([
            'name' => $data['name'],
            'cnpj' => $data['cnpj'],
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'] ?? null,
            'phone' => $data['phone'] ?? null,
            'cep' => $data['cep'] ?? null,
            'logradouro' => $data['logradouro'] ?? null,
            'numero' => $data['numero'] ?? null,
            'complemento' => $data['complemento'] ?? null,
            'bairro' => $data['bairro'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Establishment $establishment, array $data): Establishment
    {
        $establishment->update(collect($data)
            ->only([
                'name', 'cnpj', 'category_id', 'description', 'phone',
                'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'city_id', 'is_active',
            ])
            ->all());

        return $establishment;
    }

    public function delete(Establishment $establishment): void
    {
        $establishment->delete();
    }
}
