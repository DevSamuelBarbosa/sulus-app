<?php

namespace Tests\Feature\Companies;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_company_profile(): void
    {
        $this->getJson('/api/company/profile')->assertUnauthorized();
    }

    public function test_non_company_role_cannot_access_company_profile(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/company/profile')->assertForbidden();
    }

    public function test_company_can_fetch_its_own_profile(): void
    {
        $company = Company::factory()->create(['legal_name' => 'Acme LTDA']);
        Sanctum::actingAs($company->user);

        $this->getJson('/api/company/profile')
            ->assertOk()
            ->assertJsonPath('data.id', $company->id)
            ->assertJsonPath('data.legal_name', 'Acme LTDA')
            ->assertJsonPath('data.login_email', $company->user->email);
    }

    public function test_company_can_update_its_own_profile(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($company->user);

        $this->putJson('/api/company/profile', [
            'trade_name' => 'Novo Fantasia',
            'phone' => '(54) 3333-2222',
        ])->assertOk()->assertJsonPath('data.trade_name', 'Novo Fantasia');

        $this->assertDatabaseHas('companies', ['id' => $company->id, 'trade_name' => 'Novo Fantasia']);
    }

    public function test_company_cannot_change_is_active_or_cnpj_via_profile(): void
    {
        $company = Company::factory()->create(['is_active' => true, 'cnpj' => '11111111000111']);
        Sanctum::actingAs($company->user);

        $this->putJson('/api/company/profile', [
            'is_active' => false,
            'cnpj' => '22222222000122',
            'trade_name' => 'Editado',
        ])->assertOk();

        // Ignored fields stay untouched; only whitelisted ones change.
        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'is_active' => true,
            'cnpj' => '11111111000111',
            'trade_name' => 'Editado',
        ]);
    }
}
