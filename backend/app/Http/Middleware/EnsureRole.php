<?php

namespace App\Http\Middleware;

use App\Modules\Auth\Exceptions\AccountInactiveException;
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

        // Re-checked on every request (not just at login) — deactivating or
        // deleting a company/establishment must kick out an already-issued
        // token immediately, not just block new logins. See User::hasActiveProfile().
        if (! $user->hasActiveProfile()) {
            throw new AccountInactiveException;
        }

        return $next($request);
    }
}
