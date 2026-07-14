<?php

namespace App\Modules\Reports\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Reports\Services\ReportService;
use Illuminate\Http\JsonResponse;

class AdminReportController extends Controller
{
    public function __invoke(ReportService $reports): JsonResponse
    {
        return response()->json(['data' => $reports->global()]);
    }
}
