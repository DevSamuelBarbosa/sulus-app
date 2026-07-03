<?php

namespace App\Modules\Establishments\Services;

use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EstablishmentService
{
    /**
     * Create the login user and the establishment profile in a single transaction.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Establishment
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['user_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Establishment,
                'is_active' => true,
            ]);

            return $user->establishment()->create([
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
        });
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
