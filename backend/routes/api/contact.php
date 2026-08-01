<?php

use App\Modules\Contact\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

// Public — lead form reached from "Cadastre-se" on the login screen.
Route::post('contact', ContactController::class)->middleware('throttle:5,1');
