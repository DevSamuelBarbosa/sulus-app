<?php

namespace App\Modules\Employees\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\AuthUserResource;
use App\Modules\Employees\Requests\ActivateEmployeeRequest;
use App\Modules\Employees\Services\EmployeeActivationService;
use Illuminate\Http\JsonResponse;

class EmployeeActivationController extends Controller
{
    public function __construct(private readonly EmployeeActivationService $activation) {}

    /**
     * Lets the frontend confirm a link is still valid (and greet the
     * employee by name) before rendering the "set your password" form.
     */
    public function show(string $token): JsonResponse
    {
        return response()->json($this->activation->inspect($token));
    }

    /**
     * Sets the employee's password, activates the login, and signs them in
     * immediately so the invite flow ends on the dashboard, not the login
     * screen.
     */
    public function activate(ActivateEmployeeRequest $request): JsonResponse
    {
        $user = $this->activation->activate(
            $request->string('token')->toString(),
            $request->string('password')->toString(),
        );

        $token = $user->createToken('pwa', $user->role->abilities())->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new AuthUserResource($user),
        ]);
    }
}
