<?php

namespace Database\Factories;

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
            'user_id' => User::factory()->role(UserRole::Company),
            'legal_name' => fake()->company().' LTDA',
            'trade_name' => fake()->company(),
            'cnpj' => fake()->unique()->numerify('##############'),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->numerify('(##) #####-####'),
            'city_id' => null,
            'is_active' => true,
        ];
    }
}
