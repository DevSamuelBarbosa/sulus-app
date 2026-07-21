<?php

namespace Tests\Feature\Discovery;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Establishment;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EstablishmentDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_list_establishments(): void
    {
        $this->getJson('/api/establishments')->assertUnauthorized();
    }

    public function test_establishment_role_cannot_list_establishments(): void
    {
        Sanctum::actingAs(Establishment::factory()->create()->masterUser);

        $this->getJson('/api/establishments')->assertForbidden();
    }

    public function test_employee_can_list_active_establishments(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        Establishment::factory()->create(['name' => 'Restaurante Bom Sabor', 'is_active' => true]);
        Establishment::factory()->create(['name' => 'Inativo', 'is_active' => false]);

        $this->getJson('/api/establishments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Restaurante Bom Sabor');
    }

    public function test_company_can_search_establishments_by_name(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Company)->create());

        Establishment::factory()->create(['name' => 'Farmácia Central']);
        Establishment::factory()->create(['name' => 'Padaria do Bairro']);

        $this->getJson('/api/establishments?search=Farm')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Farmácia Central');
    }

    public function test_filters_by_category_city_and_state(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        $rs = State::create(['ibge_code' => '43', 'uf' => 'RS', 'name' => 'Rio Grande do Sul']);
        $sp = State::create(['ibge_code' => '35', 'uf' => 'SP', 'name' => 'São Paulo']);
        $marau = City::create(['ibge_code' => '4311809', 'state_id' => $rs->id, 'name' => 'Marau']);
        $saoPaulo = City::create(['ibge_code' => '3550308', 'state_id' => $sp->id, 'name' => 'São Paulo']);

        $saude = Category::factory()->create(['name' => 'Saúde']);
        $alimentacao = Category::factory()->create(['name' => 'Alimentação']);

        $target = Establishment::factory()->create([
            'name' => 'Clínica Marau',
            'category_id' => $saude->id,
            'city_id' => $marau->id,
        ]);
        Establishment::factory()->create([
            'name' => 'Restaurante SP',
            'category_id' => $alimentacao->id,
            'city_id' => $saoPaulo->id,
        ]);

        $this->getJson("/api/establishments?category_id={$saude->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);

        $this->getJson("/api/establishments?city_id={$marau->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);

        $this->getJson("/api/establishments?state_id={$rs->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);

        $this->getJson("/api/establishments?state_id={$sp->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Restaurante SP');
    }

    public function test_can_view_a_single_active_establishment_profile(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        $establishment = Establishment::factory()->create(['name' => 'Clínica Vida']);

        $this->getJson("/api/establishments/{$establishment->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $establishment->id)
            ->assertJsonPath('data.name', 'Clínica Vida')
            ->assertJsonMissingPath('data.is_active')
            ->assertJsonMissingPath('data.user_id');
    }

    public function test_inactive_establishment_profile_is_not_found(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        $establishment = Establishment::factory()->create(['is_active' => false]);

        $this->getJson("/api/establishments/{$establishment->id}")->assertNotFound();
    }
}
