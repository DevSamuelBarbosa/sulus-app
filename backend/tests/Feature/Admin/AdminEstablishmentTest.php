<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminEstablishmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_establishments(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Establishment)->create());

        $this->getJson('/api/admin/establishments')->assertForbidden();
    }

    public function test_admin_can_list_establishments(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Establishment::factory()->count(2)->create();

        $this->getJson('/api/admin/establishments')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_an_establishment(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create(['name' => 'Alimentação']);

        $response = $this->postJson('/api/admin/establishments', [
            'user_name' => 'Restaurante Novo',
            'email' => 'novo@restaurante.test',
            'password' => 'password123',
            'name' => 'Restaurante Novo',
            'cnpj' => '98765432000111',
            'category_id' => $category->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Restaurante Novo')
            ->assertJsonPath('data.login_email', 'novo@restaurante.test')
            ->assertJsonPath('data.category.name', 'Alimentação');

        $this->assertDatabaseHas('users', ['email' => 'novo@restaurante.test', 'role' => 'establishment']);
        $this->assertDatabaseHas('establishments', ['cnpj' => '98765432000111']);
    }

    public function test_admin_can_update_an_establishment(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $establishment = Establishment::factory()->create();

        $this->putJson("/api/admin/establishments/{$establishment->id}", [
            'name' => 'Nome Atualizado',
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Nome Atualizado')
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_delete_an_establishment(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $establishment = Establishment::factory()->create();

        $this->deleteJson("/api/admin/establishments/{$establishment->id}")->assertNoContent();

        $this->assertSoftDeleted('establishments', ['id' => $establishment->id]);
    }

    public function test_admin_stats_endpoint_returns_counts(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Establishment::factory()->count(2)->create();

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.establishments_count', 2);
    }
}
