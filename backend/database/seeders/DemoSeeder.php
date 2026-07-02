<?php

namespace Database\Seeders;

use App\Enums\EmployeeStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Development-only demo data: one user per role with linked profiles,
 * so every dashboard can be logged into during Fase 0/1. Password: "password".
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $city = City::where('name', 'Marau')->whereHas('state', fn ($q) => $q->where('uf', 'RS'))->first()
            ?? City::query()->first();

        User::updateOrCreate(
            ['email' => 'admin@sulus.test'],
            ['name' => 'Administrador Sulus', 'password' => 'password', 'role' => UserRole::Admin],
        );

        $companyUser = User::updateOrCreate(
            ['email' => 'empresa@sulus.test'],
            ['name' => 'Empresa Demo', 'password' => 'password', 'role' => UserRole::Company],
        );
        $company = Company::updateOrCreate(
            ['user_id' => $companyUser->id],
            [
                'legal_name' => 'Empresa Demo LTDA',
                'trade_name' => 'Empresa Demo',
                'cnpj' => '12345678000199',
                'email' => 'contato@empresademo.test',
                'city_id' => $city?->id,
            ],
        );

        $employeeUser = User::updateOrCreate(
            ['email' => 'funcionario@sulus.test'],
            ['name' => 'Funcionário Demo', 'password' => 'password', 'role' => UserRole::Employee],
        );
        Employee::updateOrCreate(
            ['user_id' => $employeeUser->id],
            [
                'company_id' => $company->id,
                'full_name' => 'Funcionário Demo',
                'cpf' => '12345678901',
                'benefit_status' => EmployeeStatus::Active,
            ],
        );

        $establishmentUser = User::updateOrCreate(
            ['email' => 'estabelecimento@sulus.test'],
            ['name' => 'Estabelecimento Demo', 'password' => 'password', 'role' => UserRole::Establishment],
        );
        Establishment::updateOrCreate(
            ['user_id' => $establishmentUser->id],
            [
                'name' => 'Restaurante Demo',
                'cnpj' => '98765432000188',
                'category_id' => Category::where('slug', 'alimentacao')->value('id'),
                'city_id' => $city?->id,
            ],
        );
    }
}
