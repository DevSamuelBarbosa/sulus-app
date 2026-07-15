<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Modules\Establishments\Requests\StoreEstablishmentRequest;
use App\Modules\Establishments\Requests\UpdateEstablishmentRequest;
use App\Modules\Establishments\Resources\EstablishmentResource;
use App\Modules\Establishments\Services\EstablishmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class EstablishmentController extends Controller
{
    public function __construct(private readonly EstablishmentService $establishments) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $establishments = Establishment::query()
            ->with(['user:id,email', 'city.state', 'category'])
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('cnpj', 'like', "%{$search}%");
            }))
            ->when($validated['city_id'] ?? null, fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when(
                $validated['state_id'] ?? null,
                fn ($q, $stateId) => $q->whereHas('city', fn ($q) => $q->where('state_id', $stateId)),
            )
            ->orderBy('name')
            ->paginate($validated['per_page'] ?? 15);

        return EstablishmentResource::collection($establishments);
    }

    public function store(StoreEstablishmentRequest $request): EstablishmentResource
    {
        $establishment = $this->establishments->create($request->validated());

        return new EstablishmentResource($establishment->load(['user:id,email', 'city.state', 'category']));
    }

    public function show(Establishment $establishment): EstablishmentResource
    {
        return new EstablishmentResource($establishment->load(['user:id,email', 'city.state', 'category']));
    }

    public function update(UpdateEstablishmentRequest $request, Establishment $establishment): EstablishmentResource
    {
        $this->establishments->update($establishment, $request->validated());

        return new EstablishmentResource($establishment->load(['user:id,email', 'city.state', 'category']));
    }

    public function destroy(Establishment $establishment): Response
    {
        $this->establishments->delete($establishment);

        return response()->noContent();
    }
}
