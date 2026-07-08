<?php

use App\Modules\Companies\Controllers\ProfileController;
use App\Modules\Employees\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('company')->middleware(['auth:sanctum', 'role:company'])->group(function () {
    // Company self-service profile.
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

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
