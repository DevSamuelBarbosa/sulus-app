<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Switches the bearer token used for subsequent requests. Also resets
     * cached auth guards — RequestGuard::user() memoizes its result, so
     * without this, later calls in the same test would keep resolving the
     * identity from the first request regardless of the new header.
     */
    private function asBearer(string $token): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_admin_can_impersonate_a_company(): void
    {
        // Every request below carries its own real bearer token — mixing this
        // with Sanctum::actingAs() would pin the guard's resolved user for the
        // rest of the test regardless of the Authorization header sent.
        $admin = User::factory()->admin()->create();
        $company = Company::factory()->create();
        $adminToken = $admin->createToken('pwa', $admin->role->abilities())->plainTextToken;

        $response = $this->asBearer($adminToken)->postJson("/api/admin/impersonate/{$company->masterUser->id}")
            ->assertOk()
            ->assertJsonPath('user.role', 'company')
            ->assertJsonPath('user.impersonated_by.id', $admin->id);

        $token = $response->json('token');

        $this->asBearer($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.impersonated_by.id', $admin->id)
            ->assertJsonPath('data.role', 'company');

        // Abilities are scoped to the target role, not admin.
        $this->asBearer($token)->getJson('/api/admin/stats')->assertForbidden();
    }

    public function test_admin_can_impersonate_an_establishment(): void
    {
        $admin = User::factory()->admin()->create();
        $establishment = Establishment::factory()->create();

        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/impersonate/{$establishment->masterUser->id}")
            ->assertOk()
            ->assertJsonPath('user.role', 'establishment')
            ->assertJsonPath('user.impersonated_by.id', $admin->id);
    }

    public function test_non_admin_cannot_start_impersonation(): void
    {
        $company = Company::factory()->create();
        $target = Establishment::factory()->create();

        Sanctum::actingAs($company->masterUser);

        $this->postJson("/api/admin/impersonate/{$target->masterUser->id}")->assertForbidden();
    }

    public function test_cannot_impersonate_an_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/impersonate/{$otherAdmin->id}")
            ->assertStatus(422);
    }

    public function test_cannot_impersonate_an_employee(): void
    {
        $admin = User::factory()->admin()->create();
        $employee = User::factory()->role(UserRole::Employee)->create();

        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/impersonate/{$employee->id}")
            ->assertStatus(422);
    }

    public function test_stop_restores_a_working_admin_token(): void
    {
        $admin = User::factory()->admin()->create();
        $company = Company::factory()->create();
        $adminToken = $admin->createToken('pwa', $admin->role->abilities())->plainTextToken;

        $startToken = $this->asBearer($adminToken)
            ->postJson("/api/admin/impersonate/{$company->masterUser->id}")
            ->json('token');

        $stopResponse = $this->asBearer($startToken)->deleteJson('/api/admin/impersonate')
            ->assertOk()
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('user.impersonated_by', null);

        $newAdminToken = $stopResponse->json('token');

        $this->asBearer($newAdminToken)->getJson('/api/admin/stats')->assertOk();

        // The impersonation token itself was revoked.
        $this->asBearer($startToken)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_stop_fails_when_not_impersonating(): void
    {
        // Uses a real (non-impersonation) token — Sanctum::actingAs() stubs the
        // token via Mockery, which can't stand in for the real impersonator_id
        // check that ImpersonationService::stop() performs on the DB record.
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('pwa', $admin->role->abilities())->plainTextToken;

        $this->asBearer($token)->deleteJson('/api/admin/impersonate')->assertForbidden();
    }

    public function test_stop_requires_authentication(): void
    {
        $this->deleteJson('/api/admin/impersonate')->assertUnauthorized();
    }
}
