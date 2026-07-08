<?php

namespace App\Modules\Companies\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Companies\Requests\UpdateCompanyProfileRequest;
use App\Modules\Companies\Resources\CompanyResource;
use App\Modules\Companies\Services\CompanyService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly CompanyService $companies) {}

    public function show(Request $request): CompanyResource
    {
        return new CompanyResource(
            $request->user()->company->load(['user:id,email', 'city.state']),
        );
    }

    public function update(UpdateCompanyProfileRequest $request): CompanyResource
    {
        $company = $request->user()->company;
        $this->companies->update($company, $request->validated());

        return new CompanyResource($company->load(['user:id,email', 'city.state']));
    }
}
