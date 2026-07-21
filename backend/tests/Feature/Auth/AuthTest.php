<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_valid_credentials_returns_token_and_user(): void
    {
        $user = User::factory()->admin()->create(['email' => 'admin@sulus.test']);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@sulus.test',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@sulus.test')
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_login_with_invalid_password_is_rejected(): void
    {
        User::factory()->create(['email' => 'user@sulus.test']);

        $this->postJson('/api/auth/login', [
            'email' => 'user@sulus.test',
            'password' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_login_with_unknown_email_is_rejected(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'ghost@sulus.test',
            'password' => 'password',
        ])->assertUnprocessable();
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create(['email' => 'blocked@sulus.test']);

        $this->postJson('/api/auth/login', [
            'email' => 'blocked@sulus.test',
            'password' => 'password',
        ])->assertForbidden()->assertJsonPath('code', 'account_inactive');
    }

    public function test_deactivated_company_cannot_login(): void
    {
        $company = Company::factory()->create(['is_active' => false]);

        $this->postJson('/api/auth/login', [
            'email' => $company->masterUser->email,
            'password' => 'password',
        ])->assertForbidden()->assertJsonPath('code', 'account_inactive');
    }

    public function test_deactivated_establishment_cannot_login(): void
    {
        $establishment = Establishment::factory()->create(['is_active' => false]);

        $this->postJson('/api/auth/login', [
            'email' => $establishment->masterUser->email,
            'password' => 'password',
        ])->assertForbidden()->assertJsonPath('code', 'account_inactive');
    }

    public function test_active_company_can_login(): void
    {
        $company = Company::factory()->create(['is_active' => true]);

        $this->postJson('/api/auth/login', [
            'email' => $company->masterUser->email,
            'password' => 'password',
        ])->assertOk();
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $user = User::factory()->role(UserRole::Company)->create();

        $token = $this->loginToken($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', 'company');
    }

    public function test_guest_cannot_fetch_me(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = User::factory()->create();
        $token = $this->loginToken($user);

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    private function loginToken(User $user): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        return $response->json('token');
    }
}
