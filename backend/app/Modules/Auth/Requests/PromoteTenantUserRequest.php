<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * "Sudo mode" for the Master-only master-transfer action: the acting Master
 * must redigitar their own password, checked against the currently
 * authenticated user via Laravel's built-in current_password rule.
 */
class PromoteTenantUserRequest extends FormRequest
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
            'password' => ['required', 'string', 'current_password'],
        ];
    }
}
