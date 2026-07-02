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

// Próximas fases (Fase 1+):
// require __DIR__.'/api/auth.php';
// require __DIR__.'/api/admin.php';
// require __DIR__.'/api/companies.php';
// require __DIR__.'/api/employees.php';
// require __DIR__.'/api/establishments.php';
// require __DIR__.'/api/benefits.php';
// require __DIR__.'/api/qrcode.php';
// require __DIR__.'/api/reports.php';
