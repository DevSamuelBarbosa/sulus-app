<?php

use App\Modules\Admin\Controllers\CompanyController;
use App\Modules\Admin\Controllers\EstablishmentController;
use App\Modules\Admin\Controllers\StatsController;
use App\Modules\Auth\Controllers\ImpersonateController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Reachable with an impersonation token (company/establishment abilities),
    // so it must sit outside the role:admin group below.
    Route::delete('impersonate', [ImpersonateController::class, 'stop'])
        ->middleware('throttle:20,1');

    Route::middleware('role:admin')->group(function () {
        Route::get('stats', StatsController::class);
        Route::apiResource('companies', CompanyController::class);
        Route::apiResource('establishments', EstablishmentController::class);
        Route::post('impersonate/{user}', [ImpersonateController::class, 'start'])
            ->middleware('throttle:20,1');
    });
});
