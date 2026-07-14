<?php

use App\Modules\Reports\Controllers\AdminReportController;
use App\Modules\Reports\Controllers\CompanyReportController;
use App\Modules\Reports\Controllers\CompanyUsageController;
use App\Modules\Reports\Controllers\EmployeeUsageController;
use App\Modules\Reports\Controllers\EstablishmentReportController;
use App\Modules\Reports\Controllers\EstablishmentUsageController;
use Illuminate\Support\Facades\Route;

/*
| Read-only histories and aggregates over benefit_usages (written by
| Modules/Benefits — see routes/api/benefits.php). Basic scope on purpose:
| history table + stat cards, no charting — see Fase 5 no plano.
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:employee')->group(function () {
        Route::get('employee/usages', [EmployeeUsageController::class, 'index']);
    });

    Route::middleware('role:company')->group(function () {
        Route::get('company/usages', [CompanyUsageController::class, 'index']);
        Route::get('company/reports', CompanyReportController::class);
    });

    Route::middleware('role:establishment')->group(function () {
        Route::get('establishment/usages', [EstablishmentUsageController::class, 'index']);
        Route::get('establishment/reports', EstablishmentReportController::class);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('admin/reports', AdminReportController::class);
    });
});
