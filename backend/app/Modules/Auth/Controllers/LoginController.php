<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Resources\AuthUserResource;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request, AuthService $authService): JsonResponse
    {
        $result = $authService->login($request->string('email')->toString(), $request->string('password')->toString());

        return response()->json([
            'token' => $result['token'],
            'user' => new AuthUserResource($result['user']),
        ]);
    }
}
