<?php

namespace App\Modules\Companies\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Companies\Resources\CompanyResource;
use App\Modules\Companies\Services\SelfRegistrationLinkService;
use Illuminate\Http\Request;

class SelfRegistrationLinkController extends Controller
{
    public function __construct(private readonly SelfRegistrationLinkService $links) {}

    public function store(Request $request): CompanyResource
    {
        $company = $this->links->generate($request->user()->company);

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }

    public function destroy(Request $request): CompanyResource
    {
        $company = $this->links->revoke($request->user()->company);

        return new CompanyResource($company->load(['masterUser', 'city.state']));
    }
}
