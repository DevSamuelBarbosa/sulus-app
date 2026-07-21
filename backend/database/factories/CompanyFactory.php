<?php

namespace Database\Factories;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'legal_name' => fake()->company().' LTDA',
            'trade_name' => fake()->company(),
            'cnpj' => fake()->unique()->numerify('##############'),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->numerify('(##) #####-####'),
            'city_id' => null,
            'is_active' => true,
        ];
    }

    /**
     * Every company needs at least a Master login to be usable end-to-end,
     * so factory-created companies get one by default.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Company $company) {
            User::factory()->for($company)->create([
                'role' => UserRole::Company,
                'tenant_role' => TenantRole::Master,
            ]);
        });
    }
}
