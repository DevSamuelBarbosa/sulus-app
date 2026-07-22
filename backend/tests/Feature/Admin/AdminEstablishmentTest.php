<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            'name' => 'Restaurante Novo',
            'cnpj' => '98765432000111',
            'category_id' => $category->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Restaurante Novo')
            ->assertJsonPath('data.category.name', 'Alimentação')
            ->assertJsonPath('data.master', null);

        $this->assertDatabaseHas('establishments', ['cnpj' => '98765432000111']);
    }

    public function test_admin_creates_the_first_login_which_becomes_master(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $establishment = Establishment::factory()->create();
        $establishment->users()->delete();

        $response = $this->postJson("/api/admin/establishments/{$establishment->id}/users", [
            'name' => 'Dono do Estabelecimento',
            'email' => 'dono@restaurante.test',
            'password' => 'password123',
            'tenant_role' => 'normal',
        ]);

        $response->assertCreated()->assertJsonPath('data.tenant_role', 'master');

        $this->assertDatabaseHas('users', [
            'email' => 'dono@restaurante.test',
            'role' => 'establishment',
            'establishment_id' => $establishment->id,
            'tenant_role' => 'master',
        ]);
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

    public function test_admin_can_create_an_establishment_with_a_logo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/admin/establishments', [
            'name' => 'Restaurante Com Logo',
            'cnpj' => '98765432000222',
            'logo' => UploadedFile::fake()->create('logo.jpg', 200, 'image/jpeg'),
        ]);

        $response->assertCreated();
        $this->assertNotNull($response->json('data.logo_url'));

        $establishment = Establishment::where('cnpj', '98765432000222')->firstOrFail();
        Storage::disk('public')->assertExists($establishment->logo_path);
    }

    public function test_admin_can_change_an_establishments_logo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());
        $establishment = Establishment::factory()->create();

        $response = $this->postJson("/api/admin/establishments/{$establishment->id}/logo", [
            'logo' => UploadedFile::fake()->create('novo-logo.jpg', 200, 'image/jpeg'),
        ]);

        $response->assertOk();
        $this->assertNotNull($response->json('data.logo_url'));

        $establishment->refresh();
        Storage::disk('public')->assertExists($establishment->logo_path);
    }

    public function test_non_admin_cannot_change_an_establishments_logo(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Establishment)->create());
        $establishment = Establishment::factory()->create();

        $this->postJson("/api/admin/establishments/{$establishment->id}/logo", [
            'logo' => UploadedFile::fake()->create('novo-logo.jpg', 200, 'image/jpeg'),
        ])->assertForbidden();
    }
}
