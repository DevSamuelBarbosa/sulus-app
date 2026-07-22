<?php

namespace App\Modules\Employees\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeProfileController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $employee = $request->user()->employee()->with('company')->firstOrFail();
        $company = $employee->company;

        return response()->json([
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'benefit_status' => $employee->benefit_status->value,
            ],
            'company' => [
                'id' => $company->id,
                'trade_name' => $company->trade_name,
                'logo_url' => $company->logoUrl(),
            ],
        ]);
    }
}
