<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Resources\AuthUserResource;
use App\Modules\Auth\Services\ImpersonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonateController extends Controller
{
    public function __construct(private readonly ImpersonationService $impersonation) {}

    public function start(Request $request, User $user): JsonResponse
    {
        $admin = $request->user();
        $result = $this->impersonation->start($admin, $user);

        return response()->json([
            'token' => $result['token'],
            'user' => (new AuthUserResource($result['user']))->withImpersonator($admin),
        ]);
    }

    public function stop(Request $request): JsonResponse
    {
        $result = $this->impersonation->stop($request->user());

        return response()->json([
            'token' => $result['token'],
            'user' => new AuthUserResource($result['user']),
        ]);
    }
}
