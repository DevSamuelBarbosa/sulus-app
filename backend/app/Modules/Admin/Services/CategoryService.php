<?php

namespace App\Modules\Admin\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    public function create(string $name): Category
    {
        return Category::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name),
        ]);
    }

    public function update(Category $category, string $name): Category
    {
        if ($name !== $category->name) {
            $category->slug = $this->uniqueSlug($name, $category->id);
        }

        $category->name = $name;
        $category->save();

        return $category;
    }

    public function delete(Category $category): void
    {
        if ($category->establishments()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Não é possível excluir uma categoria vinculada a estabelecimentos.',
            ]);
        }

        $category->delete();
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (
            Category::where('slug', $slug)
                ->when($ignoreId, fn ($q, $id) => $q->whereKeyNot($id))
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
