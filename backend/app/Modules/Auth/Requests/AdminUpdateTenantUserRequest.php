<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Admin update of a tenant login. Unlike the self-service
 * UpdateTenantUserRequest, admins are trusted to set tenant_role to 'master'
 * directly (no password confirmation) — TenantUserService::update() still
 * enforces the "only one Master per tenant" invariant by demoting whoever
 * currently holds it.
 */
class AdminUpdateTenantUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'tenant_role' => ['sometimes', 'required', 'string', 'in:master,administrador,normal'],
        ];
    }
}
