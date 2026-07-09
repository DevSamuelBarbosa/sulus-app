<?php

use App\Modules\Establishments\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('establishment')->middleware(['auth:sanctum', 'role:establishment'])->group(function () {
    // Establishment self-service profile — this is what feeds the discovery
    // directory (see routes/api/discovery.php), so category/address here
    // directly determines how the establishment can be found.
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
});
