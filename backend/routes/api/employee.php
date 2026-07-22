<?php

use App\Modules\Employees\Controllers\EmployeeActivationController;
use App\Modules\Employees\Controllers\EmployeeProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('employee')->group(function () {
    // Public — reached from the activation link in EmployeeInviteMail, before
    // the employee has any credentials.
    Route::get('activation/{token}', [EmployeeActivationController::class, 'show'])
        ->middleware('throttle:20,1');
    Route::post('activation', [EmployeeActivationController::class, 'activate'])
        ->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'role:employee'])->group(function () {
        Route::get('profile', EmployeeProfileController::class);
    });
});
