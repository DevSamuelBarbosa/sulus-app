<?php

namespace Tests\Feature\Establishments;

use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EstablishmentProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_establishment_profile(): void
    {
        $this->getJson('/api/establishment/profile')->assertUnauthorized();
    }

    public function test_non_establishment_role_cannot_access_establishment_profile(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/establishment/profile')->assertForbidden();
    }

    public function test_establishment_can_fetch_its_own_profile(): void
    {
        $establishment = Establishment::factory()->create(['name' => 'Restaurante Acme']);
        Sanctum::actingAs($establishment->user);

        $this->getJson('/api/establishment/profile')
            ->assertOk()
            ->assertJsonPath('data.id', $establishment->id)
            ->assertJsonPath('data.name', 'Restaurante Acme')
            ->assertJsonPath('data.login_email', $establishment->user->email);
    }

    public function test_establishment_can_update_its_own_profile(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->user);

        $this->putJson('/api/establishment/profile', [
            'description' => 'O melhor restaurante da cidade',
            'phone' => '(54) 3333-2222',
        ])->assertOk()->assertJsonPath('data.description', 'O melhor restaurante da cidade');

        $this->assertDatabaseHas('establishments', [
            'id' => $establishment->id,
            'description' => 'O melhor restaurante da cidade',
        ]);
    }

    public function test_establishment_cannot_change_is_active_or_cnpj_via_profile(): void
    {
        $establishment = Establishment::factory()->create(['is_active' => true, 'cnpj' => '11111111000111']);
        Sanctum::actingAs($establishment->user);

        $this->putJson('/api/establishment/profile', [
            'is_active' => false,
            'cnpj' => '22222222000122',
            'description' => 'Editado',
        ])->assertOk();

        // Ignored fields stay untouched; only whitelisted ones change.
        $this->assertDatabaseHas('establishments', [
            'id' => $establishment->id,
            'is_active' => true,
            'cnpj' => '11111111000111',
            'description' => 'Editado',
        ]);
    }
}
