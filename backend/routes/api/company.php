<?php

use App\Modules\Companies\Controllers\ProfileController;
use App\Modules\Companies\Controllers\TenantUserController;
use App\Modules\Employees\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('company')->middleware(['auth:sanctum', 'role:company'])->group(function () {
    // Company self-service profile.
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
    // only, password confirmed on every call (see UpdateCompanySettingsRequest).
    Route::middleware('tenant.permission:master')->group(function () {
        Route::patch('settings', [ProfileController::class, 'updateSettings']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });

    // Employee management (scoped to the authenticated company).
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::post('employees', [EmployeeController::class, 'store']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('employees/{employee}', [EmployeeController::class, 'destroy']);

    Route::post('employees/{employee}/photo', [EmployeeController::class, 'uploadPhoto']);
    Route::patch('employees/{employee}/cancel-benefit', [EmployeeController::class, 'cancelBenefit']);
    Route::patch('employees/{employee}/reactivate-benefit', [EmployeeController::class, 'reactivateBenefit']);
});
