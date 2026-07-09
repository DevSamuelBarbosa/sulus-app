<?php

namespace Tests\Feature\Discovery;

use App\Enums\UserRole;
use App\Models\City;
use App\Models\Company;
use App\Models\Establishment;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_list_companies(): void
    {
        $this->getJson('/api/companies')->assertUnauthorized();
    }

    public function test_employee_role_cannot_list_companies(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        $this->getJson('/api/companies')->assertForbidden();
    }

    public function test_establishment_can_list_active_companies(): void
    {
        Sanctum::actingAs(Establishment::factory()->create()->user);

        Company::factory()->create(['legal_name' => 'Acme LTDA', 'is_active' => true]);
        Company::factory()->create(['legal_name' => 'Inativa LTDA', 'is_active' => false]);

        $this->getJson('/api/companies')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.legal_name', 'Acme LTDA');
    }

    public function test_establishment_can_search_companies_by_trade_or_legal_name(): void
    {
        Sanctum::actingAs(Establishment::factory()->create()->user);

        Company::factory()->create(['legal_name' => 'Alfa Indústria LTDA', 'trade_name' => 'Alfa']);
        Company::factory()->create(['legal_name' => 'Beta Comércio LTDA', 'trade_name' => 'Beta']);

        $this->getJson('/api/companies?search=Alfa')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.trade_name', 'Alfa');
    }

    public function test_filters_companies_by_city_and_state(): void
    {
        Sanctum::actingAs(Establishment::factory()->create()->user);

        $rs = State::create(['ibge_code' => '43', 'uf' => 'RS', 'name' => 'Rio Grande do Sul']);
        $sp = State::create(['ibge_code' => '35', 'uf' => 'SP', 'name' => 'São Paulo']);
        $marau = City::create(['ibge_code' => '4311809', 'state_id' => $rs->id, 'name' => 'Marau']);
        $saoPaulo = City::create(['ibge_code' => '3550308', 'state_id' => $sp->id, 'name' => 'São Paulo']);

        $target = Company::factory()->create(['legal_name' => 'Empresa Marau', 'city_id' => $marau->id]);
        Company::factory()->create(['legal_name' => 'Empresa SP', 'city_id' => $saoPaulo->id]);

        $this->getJson("/api/companies?city_id={$marau->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);

        $this->getJson("/api/companies?state_id={$rs->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);

        $this->getJson("/api/companies?state_id={$sp->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.legal_name', 'Empresa SP');
    }

    public function test_company_public_resource_omits_sensitive_fields(): void
    {
        Sanctum::actingAs(Establishment::factory()->create()->user);

        Company::factory()->create(['legal_name' => 'Acme LTDA', 'cnpj' => '11111111000111']);

        $this->getJson('/api/companies')
            ->assertOk()
            ->assertJsonMissingPath('data.0.cnpj')
            ->assertJsonMissingPath('data.0.user_id')
            ->assertJsonMissingPath('data.0.login_email');
    }
}
