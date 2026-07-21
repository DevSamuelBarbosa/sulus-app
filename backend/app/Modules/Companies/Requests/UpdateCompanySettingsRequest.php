<?php

namespace App\Modules\Companies\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Master-only, password-confirmed edit of the company's sensitive fields
 * (CNPJ, active status) — see App\Http\Middleware\EnsureTenantPermission and
 * routes/api/company.php. Everything else about the profile goes through
 * UpdateCompanyProfileRequest instead.
 */
class UpdateCompanySettingsRequest extends FormRequest
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
            'cnpj' => ['sometimes', 'required', 'digits:14', Rule::unique('companies', 'cnpj')->ignore($this->user()->company_id)],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['required', 'string', 'current_password'],
        ];
    }
}
