<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Establishment;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'companies_count' => Company::count(),
                'companies_active_count' => Company::where('is_active', true)->count(),
                'establishments_count' => Establishment::count(),
                'establishments_active_count' => Establishment::where('is_active', true)->count(),
                'employees_count' => Employee::count(),
            ],
        ]);
    }
}
