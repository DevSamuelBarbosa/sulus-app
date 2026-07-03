<?php

namespace App\Modules\Companies\Services;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyService
{
    /**
     * Create the login user and the company profile in a single transaction.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Company
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['user_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Company,
                'is_active' => true,
            ]);

            return $user->company()->create([
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
        });
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
