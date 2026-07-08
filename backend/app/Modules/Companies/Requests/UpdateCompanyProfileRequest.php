<?php

namespace App\Modules\Companies\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Self-service profile edit for the authenticated company.
 *
 * CNPJ and is_active are intentionally omitted — those stay under admin
 * control and cannot be changed by the company itself.
 */
class UpdateCompanyProfileRequest extends FormRequest
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
            'legal_name' => ['sometimes', 'required', 'string', 'max:255'],
            'trade_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'cep' => ['sometimes', 'nullable', 'digits:8'],
            'logradouro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'numero' => ['sometimes', 'nullable', 'string', 'max:20'],
            'complemento' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bairro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
        ];
    }
}
