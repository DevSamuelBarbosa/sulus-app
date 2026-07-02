<?php

namespace Tests\Feature\Localization;

use App\Models\City;
use App\Models\State;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_responds(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['status' => 'ok', 'service' => 'sulus-api']);
    }

    public function test_lists_states(): void
    {
        State::create(['ibge_code' => '43', 'uf' => 'RS', 'name' => 'Rio Grande do Sul']);
        State::create(['ibge_code' => '35', 'uf' => 'SP', 'name' => 'São Paulo']);

        $this->getJson('/api/states')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.uf', 'RS'); // ordered by name (Rio... before São...)
    }

    public function test_city_autocomplete_filters_by_state_and_prefix(): void
    {
        $rs = State::create(['ibge_code' => '43', 'uf' => 'RS', 'name' => 'Rio Grande do Sul']);
        $sp = State::create(['ibge_code' => '35', 'uf' => 'SP', 'name' => 'São Paulo']);

        City::create(['ibge_code' => '4311809', 'state_id' => $rs->id, 'name' => 'Marau']);
        City::create(['ibge_code' => '4300604', 'state_id' => $rs->id, 'name' => 'Alegrete']);
        City::create(['ibge_code' => '3550308', 'state_id' => $sp->id, 'name' => 'Marília']);

        $this->getJson('/api/cities?state_id='.$rs->id.'&search=Mar')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Marau')
            ->assertJsonPath('data.0.uf', 'RS');
    }
}
