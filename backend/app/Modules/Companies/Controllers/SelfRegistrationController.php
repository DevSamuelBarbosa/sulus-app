<?php

namespace App\Modules\Companies\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\AuthUserResource;
use App\Modules\Companies\Requests\PublicRegisterEmployeeRequest;
use App\Modules\Companies\Services\SelfRegistrationService;
use Illuminate\Http\JsonResponse;

class SelfRegistrationController extends Controller
{
    public function __construct(private readonly SelfRegistrationService $registration) {}

    /**
     * Lets the frontend confirm a company's self-registration link is still
     * valid (and greet the employee with the company name) before rendering
     * the registration form.
     */
    public function show(string $token): JsonResponse
    {
        return response()->json($this->registration->inspect($token));
    }

    /**
     * Creates the employee, then signs them in immediately — same as
     * EmployeeActivationController::activate — so the flow ends on the
     * dashboard, not the login screen.
     */
    public function register(PublicRegisterEmployeeRequest $request): JsonResponse
    {
        $employee = $this->registration->register(
            $request->string('token')->toString(),
            $request->validated(),
        );

        $user = $employee->user;
        $token = $user->createToken('pwa', $user->role->abilities())->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new AuthUserResource($user),
        ]);
    }
}
