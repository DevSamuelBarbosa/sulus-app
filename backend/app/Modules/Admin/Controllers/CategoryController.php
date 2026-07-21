<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Modules\Admin\Requests\StoreCategoryRequest;
use App\Modules\Admin\Requests\UpdateCategoryRequest;
use App\Modules\Admin\Services\CategoryService;
use App\Modules\Discovery\Resources\CategoryResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Category::orderBy('name')->get());
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $category = $this->categories->create($request->string('name')->toString());

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->categories->update($category, $request->string('name')->toString());

        return new CategoryResource($category);
    }

    public function destroy(Category $category): Response
    {
        $this->categories->delete($category);

        return response()->noContent();
    }
}
