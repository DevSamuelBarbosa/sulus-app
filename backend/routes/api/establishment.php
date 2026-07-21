<?php

use App\Modules\Establishments\Controllers\ProfileController;
use App\Modules\Establishments\Controllers\TenantUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('establishment')->middleware(['auth:sanctum', 'role:establishment'])->group(function () {
    // Establishment self-service profile — this is what feeds the discovery
    // directory (see routes/api/discovery.php), so category/address here
    // directly determines how the establishment can be found.
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    // Login management — Master and Administrador only (see App\Enums\TenantRole).
    Route::middleware('tenant.permission:master,administrador')->group(function () {
        Route::get('users', [TenantUserController::class, 'index']);
        Route::post('users', [TenantUserController::class, 'store']);
        Route::put('users/{user}', [TenantUserController::class, 'update']);
        Route::delete('users/{user}', [TenantUserController::class, 'destroy']);
    });
    // Ownership transfer — Master only, and always requires re-entering the
    // password (see PromoteTenantUserRequest).
    Route::patch('users/{user}/promote-master', [TenantUserController::class, 'promoteMaster'])
        ->middleware('tenant.permission:master');

    // Sensitive settings (CNPJ, active status) and account deletion — Master
    // only, password confirmed on every call (see UpdateEstablishmentSettingsRequest).
    Route::middleware('tenant.permission:master')->group(function () {
        Route::patch('settings', [ProfileController::class, 'updateSettings']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });
});
