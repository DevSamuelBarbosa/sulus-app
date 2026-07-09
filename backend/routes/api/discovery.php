<?php

use App\Modules\Discovery\Controllers\CompanyDiscoveryController;
use App\Modules\Discovery\Controllers\EstablishmentDiscoveryController;
use Illuminate\Support\Facades\Route;

/*
| Partner directories: browsing the active network, not managing it (see
| routes/api/admin.php for the CRUD side).
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:company,employee')->group(function () {
        Route::get('establishments', [EstablishmentDiscoveryController::class, 'index']);
        Route::get('establishments/{establishment}', [EstablishmentDiscoveryController::class, 'show']);
    });

    Route::middleware('role:establishment')->group(function () {
        Route::get('companies', [CompanyDiscoveryController::class, 'index']);
    });
});
