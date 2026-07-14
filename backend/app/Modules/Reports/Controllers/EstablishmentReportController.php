<?php

namespace App\Modules\Reports\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Reports\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstablishmentReportController extends Controller
{
    public function __invoke(Request $request, ReportService $reports): JsonResponse
    {
        return response()->json(['data' => $reports->forEstablishment($request->user()->establishment)]);
    }
}
