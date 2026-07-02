<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Establishment>
 */
class EstablishmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->role(UserRole::Establishment),
            'category_id' => Category::factory(),
            'name' => fake()->company(),
            'cnpj' => fake()->unique()->numerify('##############'),
            'description' => fake()->sentence(),
            'phone' => fake()->numerify('(##) #####-####'),
            'city_id' => null,
            'is_active' => true,
        ];
    }
}
