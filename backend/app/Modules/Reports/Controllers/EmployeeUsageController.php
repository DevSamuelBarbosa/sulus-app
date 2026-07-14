<?php

namespace App\Modules\Reports\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Benefits\Resources\BenefitUsageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeUsageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $usages = $request->user()->employee->benefitUsages()
            ->with('establishment:id,name')
            ->orderByDesc('used_at')
            ->paginate($validated['per_page'] ?? 15);

        return BenefitUsageResource::collection($usages);
    }
}
