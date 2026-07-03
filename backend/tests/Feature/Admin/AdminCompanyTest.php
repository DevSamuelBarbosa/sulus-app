<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\City;
use App\Models\Company;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_companies(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Company)->create());

        $this->getJson('/api/admin/companies')->assertForbidden();
    }

    public function test_guest_cannot_access_admin_companies(): void
    {
        $this->getJson('/api/admin/companies')->assertUnauthorized();
    }

    public function test_admin_can_list_companies(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Company::factory()->count(3)->create();

        $this->getJson('/api/admin/companies')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_search_companies_by_name(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Company::factory()->create(['legal_name' => 'Acme Alimentos LTDA']);
        Company::factory()->create(['legal_name' => 'Beta Serviços LTDA']);

        $this->getJson('/api/admin/companies?search=Acme')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.legal_name', 'Acme Alimentos LTDA');
    }

    public function test_admin_can_create_a_company(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $state = State::create(['ibge_code' => '43', 'uf' => 'RS', 'name' => 'Rio Grande do Sul']);
        $city = City::create(['ibge_code' => '4311809', 'state_id' => $state->id, 'name' => 'Marau']);

        $response = $this->postJson('/api/admin/companies', [
            'user_name' => 'Empresa Nova',
            'email' => 'nova@empresa.test',
            'password' => 'password123',
            'legal_name' => 'Empresa Nova LTDA',
            'trade_name' => 'Empresa Nova',
            'cnpj' => '12345678000199',
            'contact_email' => 'contato@empresanova.test',
            'city_id' => $city->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.legal_name', 'Empresa Nova LTDA')
            ->assertJsonPath('data.login_email', 'nova@empresa.test')
            ->assertJsonPath('data.contact_email', 'contato@empresanova.test')
            ->assertJsonPath('data.city.name', 'Marau');

        $this->assertDatabaseHas('users', ['email' => 'nova@empresa.test', 'role' => 'company']);
        $this->assertDatabaseHas('companies', ['cnpj' => '12345678000199']);
    }

    public function test_creating_a_company_requires_unique_cnpj_and_email(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $existing = Company::factory()->create(['cnpj' => '11111111000111']);

        $this->postJson('/api/admin/companies', [
            'user_name' => 'Dup',
            'email' => $existing->user->email,
            'password' => 'password123',
            'legal_name' => 'Dup LTDA',
            'cnpj' => '11111111000111',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'cnpj']);
    }

    public function test_admin_can_update_a_company(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $company = Company::factory()->create(['is_active' => true]);

        $this->putJson("/api/admin/companies/{$company->id}", [
            'trade_name' => 'Nome Atualizado',
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.trade_name', 'Nome Atualizado')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('companies', ['id' => $company->id, 'trade_name' => 'Nome Atualizado', 'is_active' => false]);
    }

    public function test_admin_can_delete_a_company(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $company = Company::factory()->create();

        $this->deleteJson("/api/admin/companies/{$company->id}")->assertNoContent();

        $this->assertSoftDeleted('companies', ['id' => $company->id]);
    }
}
