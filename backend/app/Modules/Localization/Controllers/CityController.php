<?php

namespace App\Modules\Localization\Controllers;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Modules\Localization\Resources\CityResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CityController extends Controller
{
    /**
     * Autocomplete of municipalities. Filter by state and/or name fragment.
     * Kept lean (limited result set) since this feeds address selection.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $cities = City::query()
            ->with('state:id,uf')
            ->when($validated['state_id'] ?? null, fn ($q, $stateId) => $q->where('state_id', $stateId))
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where('name', 'like', "{$search}%"))
            ->orderBy('name')
            ->limit(50)
            ->get();

        return CityResource::collection($cities);
    }

    /**
     * Fetch a single city by id, with its state loaded.
     *
     * Used to resolve/display an already-selected city_id in address forms
     * even when it falls outside the default alphabetical/search page.
     */
    public function show(City $city): CityResource
    {
        return new CityResource($city->load('state:id,uf'));
    }
}
