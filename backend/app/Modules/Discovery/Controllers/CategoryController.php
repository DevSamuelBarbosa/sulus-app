<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Modules\Discovery\Resources\CategoryResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * List all establishment categories, ordered by name. Feeds filters and
     * the establishment registration form (Discovery is fleshed out in Fase 4).
     */
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::orderBy('name')->get()
        );
    }
}
