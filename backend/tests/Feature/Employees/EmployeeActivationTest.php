<?php

namespace Tests\Feature\Employees;

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EmployeeActivationTest extends TestCase
{
    use RefreshDatabase;

    private function pendingEmployee(): array
    {
        $company = Company::factory()->create();
        $user = User::factory()->for($company)->create([
            'role' => 'employee',
            'is_active' => false,
            'activation_token' => hash('sha256', 'plain-token'),
            'activation_expires_at' => now()->addDays(7),
        ]);
        $employee = Employee::factory()->for($company)->create(['user_id' => $user->id]);

        return [$user, $employee];
    }

    public function test_show_returns_name_and_email_for_a_valid_token(): void
    {
        [$user] = $this->pendingEmployee();

        $this->getJson('/api/employee/activation/plain-token')
            ->assertOk()
            ->assertJson(['name' => $user->name, 'email' => $user->email]);
    }

    public function test_show_rejects_an_unknown_token(): void
    {
        $this->getJson('/api/employee/activation/does-not-exist')
            ->assertStatus(410)
            ->assertJsonPath('code', 'activation_token_invalid');
    }

    public function test_show_rejects_an_expired_token(): void
    {
        $company = Company::factory()->create();
        User::factory()->for($company)->create([
            'role' => 'employee',
            'is_active' => false,
            'activation_token' => hash('sha256', 'expired-token'),
            'activation_expires_at' => now()->subDay(),
        ]);

        $this->getJson('/api/employee/activation/expired-token')
            ->assertStatus(410);
    }

    public function test_employee_can_activate_and_is_signed_in(): void
    {
        [$user] = $this->pendingEmployee();

        $response = $this->postJson('/api/employee/activation', [
            'token' => 'plain-token',
            'password' => 'newpassword123',
        ])->assertOk();

        $response->assertJsonPath('user.email', $user->email);
        $this->assertNotNull($response->json('token'));

        $user->refresh();
        $this->assertTrue($user->is_active);
        $this->assertNull($user->activation_token);
        $this->assertNull($user->activation_expires_at);
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_activation_token_cannot_be_reused(): void
    {
        $this->pendingEmployee();

        $this->postJson('/api/employee/activation', [
            'token' => 'plain-token',
            'password' => 'newpassword123',
        ])->assertOk();

        $this->postJson('/api/employee/activation', [
            'token' => 'plain-token',
            'password' => 'anotherpassword123',
        ])->assertStatus(410);
    }

    public function test_activation_requires_a_password_with_minimum_length(): void
    {
        $this->pendingEmployee();

        $this->postJson('/api/employee/activation', [
            'token' => 'plain-token',
            'password' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }
}
