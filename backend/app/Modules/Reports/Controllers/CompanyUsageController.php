<?php

namespace App\Modules\Reports\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Benefits\Resources\BenefitUsageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CompanyUsageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'employee_id' => ['nullable', 'integer'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $usages = $request->user()->company->benefitUsages()
            ->with('establishment:id,name')
            ->when(
                $validated['search'] ?? null,
                fn ($q, $search) => $q->where('employee_name_snapshot', 'like', "%{$search}%"),
            )
            ->when($validated['employee_id'] ?? null, fn ($q, $id) => $q->where('employee_id', $id))
            ->when($validated['from'] ?? null, fn ($q, $from) => $q->where('used_at', '>=', $from))
            ->when($validated['to'] ?? null, fn ($q, $to) => $q->where('used_at', '<=', $to))
            ->orderByDesc('used_at')
            ->paginate($validated['per_page'] ?? 15);

        return BenefitUsageResource::collection($usages);
    }
}
