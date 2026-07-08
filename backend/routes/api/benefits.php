<?php

use App\Modules\Benefits\Controllers\UsageController;
use Illuminate\Support\Facades\Route;

/*
| Registering a benefit usage: consumes the confirmation_ref minted by
| POST /qrcode/validate, so every record requires a real scan.
*/
Route::prefix('benefits')->middleware(['auth:sanctum', 'role:establishment'])->group(function () {
    Route::post('usages', [UsageController::class, 'store']);
});
