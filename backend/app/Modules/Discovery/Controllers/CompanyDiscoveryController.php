<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Modules\Discovery\Resources\CompanyPublicResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Partner-company directory for establishments: search/filter the active
 * companies whose employees may redeem the benefit here.
 */
class CompanyDiscoveryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $companies = Company::query()
            ->where('is_active', true)
            ->with('city.state')
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('legal_name', 'like', "%{$search}%")
                    ->orWhere('trade_name', 'like', "%{$search}%");
            }))
            ->when($validated['city_id'] ?? null, fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when($validated['state_id'] ?? null, fn ($q, $stateId) => $q->whereHas(
                'city', fn ($q) => $q->where('state_id', $stateId)
            ))
            ->orderBy('legal_name')
            ->paginate($validated['per_page'] ?? 15);

        return CompanyPublicResource::collection($companies);
    }
}
