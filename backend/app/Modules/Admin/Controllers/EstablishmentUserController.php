<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\User;
use App\Modules\Auth\Requests\AdminUpdateTenantUserRequest;
use App\Modules\Auth\Requests\StoreTenantUserRequest;
use App\Modules\Auth\Resources\TenantUserResource;
use App\Modules\Auth\Services\TenantUserService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Admin management of an establishment's logins — see
 * App\Modules\Admin\Controllers\CompanyUserController for the rationale.
 */
class EstablishmentUserController extends Controller
{
    public function __construct(private readonly TenantUserService $tenantUsers) {}

    public function index(Establishment $establishment): AnonymousResourceCollection
    {
        return TenantUserResource::collection($this->tenantUsers->list($establishment));
    }

    public function store(StoreTenantUserRequest $request, Establishment $establishment): TenantUserResource
    {
        return new TenantUserResource($this->tenantUsers->create($establishment, $request->validated()));
    }

    public function update(
        AdminUpdateTenantUserRequest $request,
        Establishment $establishment,
        User $user,
    ): TenantUserResource {
        abort_unless($user->establishment_id === $establishment->id, 404);

        return new TenantUserResource($this->tenantUsers->update($user, $request->validated()));
    }

    public function destroy(Establishment $establishment, User $user): Response
    {
        abort_unless($user->establishment_id === $establishment->id, 404);

        $this->tenantUsers->remove($user);

        return response()->noContent();
    }
}
