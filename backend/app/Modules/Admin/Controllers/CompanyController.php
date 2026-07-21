<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Modules\Companies\Requests\StoreCompanyRequest;
use App\Modules\Companies\Requests\UpdateCompanyRequest;
use App\Modules\Companies\Resources\CompanyResource;
use App\Modules\Companies\Services\CompanyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CompanyController extends Controller
{
    public function __construct(private readonly CompanyService $companies) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $companies = Company::query()
            ->with(['masterUser', 'city.state'])
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('legal_name', 'like', "%{$search}%")
                    ->orWhere('trade_name', 'like', "%{$search}%")
                    ->orWhere('cnpj', 'like', "%{$search}%");
            }))
            ->when($validated['city_id'] ?? null, fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when(
                $validated['state_id'] ?? null,
                fn ($q, $stateId) => $q->whereHas('city', fn ($q) => $q->where('state_id', $stateId)),
            )
            ->orderBy('legal_name')
            ->paginate($validated['per_page'] ?? 15);

        return CompanyResource::collection($companies);
    }

    public function store(StoreCompanyRequest $request): CompanyResource
    {
        $company = $this->companies->create($request->validated());

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    public function show(Company $company): CompanyResource
    {
        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    public function update(UpdateCompanyRequest $request, Company $company): CompanyResource
    {
        $this->companies->update($company, $request->validated());

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    public function destroy(Company $company): Response
    {
        $this->companies->delete($company);

        return response()->noContent();
    }
}
