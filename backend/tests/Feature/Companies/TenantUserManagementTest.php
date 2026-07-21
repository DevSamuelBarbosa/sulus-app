<?php

namespace Tests\Feature\Companies;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tenantUser(Company $company, TenantRole $role): User
    {
        return User::factory()->for($company)->create([
            'role' => UserRole::Company,
            'tenant_role' => $role,
        ]);
    }

    public function test_administrador_can_create_a_login(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($this->tenantUser($company, TenantRole::Administrador));

        $this->postJson('/api/company/users', [
            'name' => 'Novo Login',
            'email' => 'novo@empresa.test',
            'password' => 'password123',
            'tenant_role' => 'normal',
        ])->assertCreated()->assertJsonPath('data.tenant_role', 'normal');

        $this->assertDatabaseHas('users', [
            'email' => 'novo@empresa.test',
            'company_id' => $company->id,
            'tenant_role' => 'normal',
        ]);
    }

    public function test_creating_a_login_as_master_directly_is_rejected(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($company->masterUser);

        $this->postJson('/api/company/users', [
            'name' => 'Tentativa',
            'email' => 'tentativa@empresa.test',
            'password' => 'password123',
            'tenant_role' => 'master',
        ])->assertUnprocessable()->assertJsonValidationErrors(['tenant_role']);
    }

    public function test_promoting_via_update_is_rejected_for_self_service(): void
    {
        $company = Company::factory()->create();
        $administrador = $this->tenantUser($company, TenantRole::Administrador);
        Sanctum::actingAs($company->masterUser);

        $this->putJson("/api/company/users/{$administrador->id}", ['tenant_role' => 'master'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tenant_role']);
    }

    public function test_normal_user_is_blocked_from_managing_logins(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($this->tenantUser($company, TenantRole::Normal));

        $this->getJson('/api/company/users')->assertForbidden();
        $this->postJson('/api/company/users', [
            'name' => 'X', 'email' => 'x@empresa.test', 'password' => 'password123', 'tenant_role' => 'normal',
        ])->assertForbidden();
    }

    public function test_promote_master_requires_the_correct_password(): void
    {
        $company = Company::factory()->create();
        $master = $company->masterUser;
        $administrador = $this->tenantUser($company, TenantRole::Administrador);
        Sanctum::actingAs($master);

        $this->patchJson("/api/company/users/{$administrador->id}/promote-master", ['password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('users', ['id' => $master->id, 'tenant_role' => 'master']);
        $this->assertDatabaseHas('users', ['id' => $administrador->id, 'tenant_role' => 'administrador']);
    }

    public function test_promote_master_transfers_ownership(): void
    {
        $company = Company::factory()->create();
        $master = $company->masterUser;
        $administrador = $this->tenantUser($company, TenantRole::Administrador);
        Sanctum::actingAs($master);

        $this->patchJson("/api/company/users/{$administrador->id}/promote-master", ['password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.tenant_role', 'master');

        $this->assertDatabaseHas('users', ['id' => $master->id, 'tenant_role' => 'administrador']);
        $this->assertDatabaseHas('users', ['id' => $administrador->id, 'tenant_role' => 'master']);
    }

    public function test_administrador_cannot_promote_a_login_to_master(): void
    {
        $company = Company::factory()->create();
        $administrador = $this->tenantUser($company, TenantRole::Administrador);
        $normal = $this->tenantUser($company, TenantRole::Normal);
        Sanctum::actingAs($administrador);

        $this->patchJson("/api/company/users/{$normal->id}/promote-master", ['password' => 'password'])
            ->assertForbidden();
    }

    public function test_cannot_remove_the_only_master(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($company->masterUser);

        $this->deleteJson("/api/company/users/{$company->masterUser->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['user']);
    }

    public function test_administrador_can_remove_a_normal_login(): void
    {
        $company = Company::factory()->create();
        $normal = $this->tenantUser($company, TenantRole::Normal);
        Sanctum::actingAs($this->tenantUser($company, TenantRole::Administrador));

        $this->deleteJson("/api/company/users/{$normal->id}")->assertNoContent();

        $this->assertDatabaseHas('users', ['id' => $normal->id, 'is_active' => false]);
    }

    public function test_cannot_manage_logins_of_another_company(): void
    {
        $company = Company::factory()->create();
        $otherCompany = Company::factory()->create();
        Sanctum::actingAs($company->masterUser);

        $this->putJson("/api/company/users/{$otherCompany->masterUser->id}", ['name' => 'Hijack'])
            ->assertNotFound();
    }
}
