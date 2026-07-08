<?php

use App\Modules\Localization\Controllers\CityController;
use App\Modules\Localization\Controllers\StateController;
use Illuminate\Support\Facades\Route;

/*
| Canonical reference data (IBGE). Public: feeds address selection on the
| registration/edit forms so cities/states are never free text.
*/
Route::get('states', [StateController::class, 'index']);
Route::get('cities', [CityController::class, 'index']);
Route::get('cities/{city}', [CityController::class, 'show']);
