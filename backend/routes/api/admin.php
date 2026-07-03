<?php

use App\Modules\Admin\Controllers\CompanyController;
use App\Modules\Admin\Controllers\EstablishmentController;
use App\Modules\Admin\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('stats', StatsController::class);
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('establishments', EstablishmentController::class);
});
