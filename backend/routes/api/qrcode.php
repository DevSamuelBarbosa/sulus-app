<?php

use App\Modules\QrCode\Controllers\GenerateTokenController;
use App\Modules\QrCode\Controllers\TokenStatusController;
use App\Modules\QrCode\Controllers\ValidateTokenController;
use Illuminate\Support\Facades\Route;

/*
| QR token lifecycle: generation (employee), validation (establishment), and
| status polling (employee — so its screen can tell when the token was
| redeemed). Throttled to blunt brute-force/abuse.
*/
Route::prefix('qrcode')->middleware('auth:sanctum')->group(function () {
    Route::post('generate', GenerateTokenController::class)
        ->middleware(['role:employee', 'throttle:30,1']);

    Route::get('status/{token}', TokenStatusController::class)
        ->middleware(['role:employee', 'throttle:60,1']);

    Route::post('validate', ValidateTokenController::class)
        ->middleware(['role:establishment', 'throttle:30,1']);
});
