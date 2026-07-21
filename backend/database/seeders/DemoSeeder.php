<?php

namespace Database\Seeders;

use App\Enums\EmployeeStatus;
use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Development-only demo data: one user per role with linked profiles, so
 * every dashboard can be logged into during development. The company and
 * establishment each get all 3 tenant permission levels (see App\Enums\TenantRole)
 * so the Master/Administrador/Usuário Normal flows can be exercised without
 * creating logins by hand. Password: "password" for every login.
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

        $company = Company::updateOrCreate(
            ['cnpj' => '12345678000199'],
            [
                'legal_name' => 'Empresa Demo LTDA',
                'trade_name' => 'Empresa Demo',
                'email' => 'contato@empresademo.test',
                'city_id' => $city?->id,
            ],
        );
        $this->tenantLogins($company, 'empresa', UserRole::Company);

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

        $establishment = Establishment::updateOrCreate(
            ['cnpj' => '98765432000188'],
            [
                'name' => 'Restaurante Demo',
                'category_id' => Category::where('slug', 'barbearias')->value('id'),
                'city_id' => $city?->id,
            ],
        );
        $this->tenantLogins($establishment, 'estabelecimento', UserRole::Establishment);
    }

    private function tenantLogins(Company|Establishment $tenant, string $prefix, UserRole $role): void
    {
        $tenantColumn = $tenant instanceof Company ? 'company_id' : 'establishment_id';

        foreach (TenantRole::cases() as $tenantRole) {
            User::updateOrCreate(
                ['email' => "{$prefix}.{$tenantRole->value}@sulus.test"],
                [
                    'name' => ucfirst($prefix)." ({$tenantRole->label()})",
                    'password' => 'password',
                    'role' => $role,
                    'tenant_role' => $tenantRole,
                    $tenantColumn => $tenant->id,
                ],
            );
        }
    }
}
