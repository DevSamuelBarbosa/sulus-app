<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Self-service update of another login in the same tenant (Master or
 * Administrador acting). Deliberately cannot set tenant_role to 'master' —
 * ownership transfer requires the dedicated password-confirmed action.
 */
class UpdateTenantUserRequest extends FormRequest
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
            'tenant_role' => ['sometimes', 'required', 'string', 'in:administrador,normal'],
        ];
    }
}
