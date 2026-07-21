<?php

namespace App\Modules\Companies\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Companies\Requests\UpdateCompanyProfileRequest;
use App\Modules\Companies\Requests\UpdateCompanySettingsRequest;
use App\Modules\Companies\Resources\CompanyResource;
use App\Modules\Companies\Services\CompanyService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly CompanyService $companies) {}

    public function show(Request $request): CompanyResource
    {
        return new CompanyResource(
            $request->user()->company->load(['masterUser', 'city.state']),
        );
    }

    public function update(UpdateCompanyProfileRequest $request): CompanyResource
    {
        $company = $request->user()->company;
        $this->companies->update($company, $request->validated());

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    /**
     * Master-only, password-confirmed edit of CNPJ/active status — see
     * UpdateCompanySettingsRequest.
     */
    public function updateSettings(UpdateCompanySettingsRequest $request): CompanyResource
    {
        $company = $request->user()->company;
        $this->companies->update($company, collect($request->validated())->only(['cnpj', 'is_active'])->all());

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    /**
     * Self-service account deletion — Master-only, password-confirmed (see
     * UpdateCompanySettingsRequest reused here for its password rule).
     */
    public function destroy(UpdateCompanySettingsRequest $request): Response
    {
        $company = $request->user()->company;
        $company->users()->update(['is_active' => false]);
        $this->companies->delete($company);

        return response()->noContent();
    }
}
