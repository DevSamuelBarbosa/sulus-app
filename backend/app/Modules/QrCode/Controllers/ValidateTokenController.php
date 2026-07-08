<?php

namespace App\Modules\QrCode\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\QrCode\Resources\EmployeeCheckResource;
use App\Modules\QrCode\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValidateTokenController extends Controller
{
    public function __invoke(Request $request, QrTokenService $qrTokens): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $result = $qrTokens->validate($validated['token']);

        return response()->json([
            'confirmation_ref' => $result['confirmation_ref'],
            'expires_in' => $result['expires_in'],
            'employee' => new EmployeeCheckResource($result['employee']),
        ]);
    }
}
