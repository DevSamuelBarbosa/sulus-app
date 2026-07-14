<?php

namespace App\Modules\Reports\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Benefits\Resources\BenefitUsageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstablishmentUsageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $usages = $request->user()->establishment->benefitUsages()
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('employee_name_snapshot', 'like', "%{$search}%")
                    ->orWhere('company_name_snapshot', 'like', "%{$search}%");
            }))
            ->when($validated['from'] ?? null, fn ($q, $from) => $q->where('used_at', '>=', $from))
            ->when($validated['to'] ?? null, fn ($q, $to) => $q->where('used_at', '<=', $to))
            ->orderByDesc('used_at')
            ->paginate($validated['per_page'] ?? 15);

        return BenefitUsageResource::collection($usages);
    }
}
