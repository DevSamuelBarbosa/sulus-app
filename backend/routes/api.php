<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (feature-first / per module)
|--------------------------------------------------------------------------
|
| Each business module owns a file under routes/api/. This aggregator wires
| them so controllers/services live next to their routes in app/Modules/*.
|
*/

Route::get('/health', fn () => [
    'status' => 'ok',
    'service' => 'sulus-api',
]);

require __DIR__.'/api/localization.php';
require __DIR__.'/api/categories.php';
require __DIR__.'/api/auth.php';
require __DIR__.'/api/admin.php';
require __DIR__.'/api/company.php';
require __DIR__.'/api/establishment.php';
require __DIR__.'/api/qrcode.php';
require __DIR__.'/api/benefits.php';
require __DIR__.'/api/discovery.php';

// Próximas fases (Fase 5+):
// require __DIR__.'/api/reports.php';
