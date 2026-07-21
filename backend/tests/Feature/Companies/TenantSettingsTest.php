<?php

namespace Tests\Feature\Companies;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function tenantUser(Company $company, TenantRole $role): User
    {
        return User::factory()->for($company)->create([
            'role' => UserRole::Company,
            'tenant_role' => $role,
        ]);
    }

    public function test_master_can_update_cnpj_with_correct_password(): void
    {
        $company = Company::factory()->create(['cnpj' => '11111111000111']);
        Sanctum::actingAs($company->masterUser);

        $this->patchJson('/api/company/settings', [
            'cnpj' => '22222222000122',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.cnpj', '22222222000122');

        $this->assertDatabaseHas('companies', ['id' => $company->id, 'cnpj' => '22222222000122']);
    }

    public function test_updating_settings_with_wrong_password_fails(): void
    {
        $company = Company::factory()->create(['cnpj' => '11111111000111']);
        Sanctum::actingAs($company->masterUser);

        $this->patchJson('/api/company/settings', [
            'cnpj' => '22222222000122',
            'password' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('companies', ['id' => $company->id, 'cnpj' => '11111111000111']);
    }

    public function test_administrador_cannot_update_settings(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($this->tenantUser($company, TenantRole::Administrador));

        $this->patchJson('/api/company/settings', [
            'cnpj' => '22222222000122',
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_master_can_delete_the_account_with_correct_password(): void
    {
        $company = Company::factory()->create();
        $master = $company->masterUser;
        Sanctum::actingAs($master);

        $this->deleteJson('/api/company', ['password' => 'password'])->assertNoContent();

        $this->assertSoftDeleted('companies', ['id' => $company->id]);
        $this->assertDatabaseHas('users', ['id' => $master->id, 'is_active' => false]);
    }

    public function test_deleting_the_account_requires_the_correct_password(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($company->masterUser);

        $this->deleteJson('/api/company', ['password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertNotSoftDeleted('companies', ['id' => $company->id]);
    }
}
