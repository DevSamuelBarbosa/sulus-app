<?php

namespace Tests\Feature\Discovery;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_categories_ordered_by_name(): void
    {
        Category::create(['name' => 'Saúde', 'slug' => 'saude']);
        Category::create(['name' => 'Alimentação', 'slug' => 'alimentacao']);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Alimentação');
    }
}
