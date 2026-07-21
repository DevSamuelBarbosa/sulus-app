<?php

use App\Modules\Admin\Controllers\CategoryController;
use App\Modules\Admin\Controllers\CompanyController;
use App\Modules\Admin\Controllers\CompanyUserController;
use App\Modules\Admin\Controllers\EstablishmentController;
use App\Modules\Admin\Controllers\EstablishmentUserController;
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
        Route::apiResource('categories', CategoryController::class)->except(['show']);

        // Login management for a tenant — admin bypasses the tenant.permission
        // gate and password confirmation self-service requires (see
        // App\Modules\Admin\Controllers\CompanyUserController).
        Route::prefix('companies/{company}/users')->group(function () {
            Route::get('/', [CompanyUserController::class, 'index']);
            Route::post('/', [CompanyUserController::class, 'store']);
            Route::put('/{user}', [CompanyUserController::class, 'update']);
            Route::delete('/{user}', [CompanyUserController::class, 'destroy']);
        });
        Route::prefix('establishments/{establishment}/users')->group(function () {
            Route::get('/', [EstablishmentUserController::class, 'index']);
            Route::post('/', [EstablishmentUserController::class, 'store']);
            Route::put('/{user}', [EstablishmentUserController::class, 'update']);
            Route::delete('/{user}', [EstablishmentUserController::class, 'destroy']);
        });
        Route::post('impersonate/{user}', [ImpersonateController::class, 'start'])
            ->middleware('throttle:20,1');
    });
});
