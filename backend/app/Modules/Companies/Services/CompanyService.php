<?php

namespace App\Modules\Companies\Services;

use App\Models\Company;

class CompanyService
{
    /**
     * Creates only the company profile — logins are created separately via
     * App\Modules\Auth\Services\TenantUserService (the first one created
     * becomes the tenant's Master automatically).
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Company
    {
        return Company::create([
            'legal_name' => $data['legal_name'],
            'trade_name' => $data['trade_name'] ?? null,
            'cnpj' => $data['cnpj'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['contact_email'] ?? null,
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
    public function update(Company $company, array $data): Company
    {
        if (array_key_exists('contact_email', $data)) {
            $data['email'] = $data['contact_email'];
        }

        $company->update(collect($data)
            ->only([
                'legal_name', 'trade_name', 'cnpj', 'phone', 'email',
                'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'city_id', 'is_active',
            ])
            ->all());

        return $company;
    }

    public function delete(Company $company): void
    {
        $company->delete();
    }
}
