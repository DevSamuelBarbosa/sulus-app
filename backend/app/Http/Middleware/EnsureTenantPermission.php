<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to one or more tenant permission levels (see
 * App\Enums\TenantRole), for company/establishment logins. Must run after
 * 'auth:sanctum' and 'role:company'/'role:establishment' — this only checks
 * the permission *within* the tenant, not the tenant type itself. Usage:
 * ->middleware('tenant.permission:master') or
 * ->middleware('tenant.permission:master,administrador').
 */
class EnsureTenantPermission
{
    public function handle(Request $request, Closure $next, string ...$levels): Response
    {
        $tenantRole = $request->user()?->tenant_role;

        if (! $tenantRole || ! in_array($tenantRole->value, $levels, true)) {
            abort(403, 'Ação não permitida para seu nível de permissão.');
        }

        return $next($request);
    }
}
