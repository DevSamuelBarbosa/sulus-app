<?php

namespace App\Modules\QrCode\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\QrCode\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TokenStatusController extends Controller
{
    public function __invoke(Request $request, string $token, QrTokenService $qrTokens): JsonResponse
    {
        return response()->json($qrTokens->status($token, $request->user()->employee->id));
    }
}
