<?php

namespace App\Modules\Benefits\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Benefits\Resources\BenefitUsageResource;
use App\Modules\Benefits\Services\BenefitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    public function store(Request $request, BenefitService $benefits): JsonResponse
    {
        $validated = $request->validate([
            'confirmation_ref' => ['required', 'string'],
        ]);

        $usage = $benefits->registerUsage($validated['confirmation_ref'], $request->user());

        return response()->json(['data' => new BenefitUsageResource($usage)], 201);
    }
}
