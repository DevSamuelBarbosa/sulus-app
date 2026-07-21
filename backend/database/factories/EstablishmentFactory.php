<?php

namespace Database\Factories;

use App\Enums\TenantRole;
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
            'category_id' => Category::factory(),
            'name' => fake()->company(),
            'cnpj' => fake()->unique()->numerify('##############'),
            'description' => fake()->sentence(),
            'phone' => fake()->numerify('(##) #####-####'),
            'city_id' => null,
            'is_active' => true,
        ];
    }

    /**
     * Every establishment needs at least a Master login to be usable
     * end-to-end, so factory-created establishments get one by default.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Establishment $establishment) {
            User::factory()->for($establishment)->create([
                'role' => UserRole::Establishment,
                'tenant_role' => TenantRole::Master,
            ]);
        });
    }
}
