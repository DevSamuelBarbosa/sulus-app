<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            // Never 'master' here: a tenant's first login always becomes
            // Master automatically (see TenantUserService::create), and
            // promoting an existing login to Master afterwards goes through
            // a dedicated, password-confirmed action.
            'tenant_role' => ['required', 'string', 'in:administrador,normal'],
        ];
    }
}
