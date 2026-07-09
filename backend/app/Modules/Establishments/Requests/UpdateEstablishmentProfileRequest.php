<?php

namespace App\Modules\Establishments\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Self-service profile edit for the authenticated establishment.
 *
 * CNPJ and is_active are intentionally omitted — those stay under admin
 * control and cannot be changed by the establishment itself.
 */
class UpdateEstablishmentProfileRequest extends FormRequest
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
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'description' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'cep' => ['sometimes', 'nullable', 'digits:8'],
            'logradouro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'numero' => ['sometimes', 'nullable', 'string', 'max:20'],
            'complemento' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bairro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
        ];
    }
}
