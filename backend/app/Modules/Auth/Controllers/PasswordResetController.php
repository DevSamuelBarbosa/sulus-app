<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Requests\ResetPasswordRequest;
use App\Modules\Auth\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(private readonly PasswordResetService $passwordReset) {}

    /**
     * Always responds with the same generic message, whether or not the
     * e-mail is registered — see PasswordResetService::sendResetLink.
     */
    public function sendLink(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordReset->sendResetLink($request->string('email')->toString());

        return response()->json([
            'message' => 'Se o e-mail existir, você receberá um link em instantes.',
        ]);
    }

    /**
     * Confirms the new password without logging the user in — unlike the
     * employee activation flow, this isn't a first login, so sending them
     * back to /login is the expected, more familiar UX.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordReset->reset(
            $request->string('token')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }
}
