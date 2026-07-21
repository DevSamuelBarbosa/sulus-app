<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Modules\Auth\Requests\AdminUpdateTenantUserRequest;
use App\Modules\Auth\Requests\StoreTenantUserRequest;
use App\Modules\Auth\Resources\TenantUserResource;
use App\Modules\Auth\Services\TenantUserService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Admin management of a company's logins — no tenant-permission gate (admin
 * is already a superuser) and, unlike self-service, allowed to set
 * tenant_role to 'master' directly without a password confirmation.
 */
class CompanyUserController extends Controller
{
    public function __construct(private readonly TenantUserService $tenantUsers) {}

    public function index(Company $company): AnonymousResourceCollection
    {
        return TenantUserResource::collection($this->tenantUsers->list($company));
    }

    public function store(StoreTenantUserRequest $request, Company $company): TenantUserResource
    {
        return new TenantUserResource($this->tenantUsers->create($company, $request->validated()));
    }

    public function update(AdminUpdateTenantUserRequest $request, Company $company, User $user): TenantUserResource
    {
        abort_unless($user->company_id === $company->id, 404);

        return new TenantUserResource($this->tenantUsers->update($user, $request->validated()));
    }

    public function destroy(Company $company, User $user): Response
    {
        abort_unless($user->company_id === $company->id, 404);

        $this->tenantUsers->remove($user);

        return response()->noContent();
    }
}
