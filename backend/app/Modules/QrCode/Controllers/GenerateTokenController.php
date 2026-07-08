<?php

namespace App\Modules\QrCode\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\QrCode\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenerateTokenController extends Controller
{
    public function __invoke(Request $request, QrTokenService $qrTokens): JsonResponse
    {
        $result = $qrTokens->generate($request->user()->employee);

        return response()->json($result, 201);
    }
}
