<?php

namespace App\Modules\Establishments\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Master-only, password-confirmed edit of the establishment's sensitive
 * fields (CNPJ, active status) — see App\Http\Middleware\EnsureTenantPermission
 * and routes/api/establishment.php. Everything else about the profile goes
 * through UpdateEstablishmentProfileRequest instead.
 */
class UpdateEstablishmentSettingsRequest extends FormRequest
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
            // Accepts Receita Federal's upcoming alphanumeric CNPJ — see
            // Companies\Requests\StoreCompanyRequest.
            'cnpj' => [
                'sometimes', 'required', 'size:14', 'regex:/^[A-Z0-9]{12}\d{2}$/',
                Rule::unique('establishments', 'cnpj')->ignore($this->user()->establishment_id),
            ],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['required', 'string', 'current_password'],
        ];
    }
}
