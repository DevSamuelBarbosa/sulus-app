<?php

namespace Database\Factories;

use App\Enums\EmployeeStatus;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->role(UserRole::Employee),
            'company_id' => Company::factory(),
            'full_name' => fake()->name(),
            'cpf' => fake()->unique()->numerify('###########'),
            'phone' => fake()->numerify('(##) #####-####'),
            'benefit_status' => EmployeeStatus::Active,
            'hired_at' => fake()->dateTimeBetween('-3 years'),
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'benefit_status' => EmployeeStatus::Cancelled,
        ]);
    }
}
