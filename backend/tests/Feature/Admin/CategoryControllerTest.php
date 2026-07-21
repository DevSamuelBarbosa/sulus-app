<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_manage_categories(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Company)->create());

        $this->postJson('/api/admin/categories', ['name' => 'Barbearias'])->assertForbidden();
    }

    public function test_admin_can_create_a_category(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/admin/categories', ['name' => 'Barbearias']);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Barbearias')
            ->assertJsonPath('data.slug', 'barbearias');

        $this->assertDatabaseHas('categories', ['name' => 'Barbearias', 'slug' => 'barbearias']);
    }

    public function test_creating_a_category_requires_a_unique_name(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Category::create(['name' => 'Barbearias', 'slug' => 'barbearias']);

        $this->postJson('/api/admin/categories', ['name' => 'Barbearias'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_update_a_category_and_slug_is_regenerated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::create(['name' => 'Salões de Beleza', 'slug' => 'saloes-de-beleza']);

        $this->putJson("/api/admin/categories/{$category->id}", ['name' => 'Salões de Beleza e Estética'])
            ->assertOk()
            ->assertJsonPath('data.slug', 'saloes-de-beleza-e-estetica');
    }

    public function test_admin_can_delete_an_unused_category(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::create(['name' => 'Massoterapia', 'slug' => 'massoterapia']);

        $this->deleteJson("/api/admin/categories/{$category->id}")->assertNoContent();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_admin_cannot_delete_a_category_in_use(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::create(['name' => 'Clínicas Estéticas', 'slug' => 'clinicas-esteticas']);
        Establishment::factory()->create(['category_id' => $category->id]);

        $this->deleteJson("/api/admin/categories/{$category->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}
