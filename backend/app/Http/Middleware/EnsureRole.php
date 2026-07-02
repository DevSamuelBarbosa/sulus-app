<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to one or more user roles. Usage: ->middleware('role:company')
 * or ->middleware('role:company,admin'). Must run after 'auth:sanctum'.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active || ! in_array($user->role->value, $roles, true)) {
            abort(403, 'Acesso não autorizado para este papel.');
        }

        return $next($request);
    }
}
