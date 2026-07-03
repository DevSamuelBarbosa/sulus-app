<?php

use App\Http\Middleware\EnsureRole;
use App\Modules\Auth\Exceptions\AccountInactiveException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Expected business condition, not a bug — don't log it.
        $exceptions->dontReport(AccountInactiveException::class);

        $exceptions->render(fn (AccountInactiveException $e) => new JsonResponse([
            'message' => $e->getMessage(),
            'code' => 'account_inactive',
        ], 403));
    })->create();
