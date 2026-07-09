<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Modules\Discovery\Resources\EstablishmentPublicResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Partner-establishment directory for companies and employees: search/filter
 * the active network and view a public profile before visiting. Distinct
 * from Admin\EstablishmentController, which manages the full CRUD lifecycle
 * (including inactive records) and is admin-only.
 */
class EstablishmentDiscoveryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $establishments = Establishment::query()
            ->where('is_active', true)
            ->with(['category', 'city.state'])
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->when($validated['category_id'] ?? null, fn ($q, $categoryId) => $q->where('category_id', $categoryId))
            ->when($validated['city_id'] ?? null, fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when($validated['state_id'] ?? null, fn ($q, $stateId) => $q->whereHas(
                'city', fn ($q) => $q->where('state_id', $stateId)
            ))
            ->orderBy('name')
            ->paginate($validated['per_page'] ?? 15);

        return EstablishmentPublicResource::collection($establishments);
    }

    public function show(Establishment $establishment): EstablishmentPublicResource
    {
        abort_if(! $establishment->is_active, 404);

        return new EstablishmentPublicResource($establishment->load(['category', 'city.state']));
    }
}
