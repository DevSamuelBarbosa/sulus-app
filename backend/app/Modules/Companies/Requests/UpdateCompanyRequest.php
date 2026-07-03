<?php

namespace App\Modules\Companies\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
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
        $company = $this->route('company');

        return [
            'legal_name' => ['sometimes', 'required', 'string', 'max:255'],
            'trade_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'cnpj' => ['sometimes', 'required', 'digits:14', Rule::unique('companies', 'cnpj')->ignore($company)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'cep' => ['sometimes', 'nullable', 'digits:8'],
            'logradouro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'numero' => ['sometimes', 'nullable', 'string', 'max:20'],
            'complemento' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bairro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
