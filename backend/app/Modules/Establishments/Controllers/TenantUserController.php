<?php

namespace App\Modules\Establishments\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Requests\PromoteTenantUserRequest;
use App\Modules\Auth\Requests\StoreTenantUserRequest;
use App\Modules\Auth\Requests\UpdateTenantUserRequest;
use App\Modules\Auth\Resources\TenantUserResource;
use App\Modules\Auth\Services\TenantUserService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Self-service management of the logins belonging to the authenticated
 * establishment (Master/Administrador only — see routes/api/establishment.php).
 */
class TenantUserController extends Controller
{
    public function __construct(private readonly TenantUserService $tenantUsers) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return TenantUserResource::collection($this->tenantUsers->list($request->user()->establishment));
    }

    public function store(StoreTenantUserRequest $request): TenantUserResource
    {
        return new TenantUserResource(
            $this->tenantUsers->create($request->user()->establishment, $request->validated()),
        );
    }

    public function update(UpdateTenantUserRequest $request, User $user): TenantUserResource
    {
        abort_unless($user->establishment_id === $request->user()->establishment_id, 404);

        return new TenantUserResource($this->tenantUsers->update($user, $request->validated()));
    }

    public function destroy(Request $request, User $user): Response
    {
        abort_unless($user->establishment_id === $request->user()->establishment_id, 404);

        $this->tenantUsers->remove($user);

        return response()->noContent();
    }

    public function promoteMaster(PromoteTenantUserRequest $request, User $user): TenantUserResource
    {
        abort_unless($user->establishment_id === $request->user()->establishment_id, 404);

        return new TenantUserResource($this->tenantUsers->update($user, ['tenant_role' => 'master']));
    }
}
