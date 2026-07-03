<?php

namespace App\Modules\Establishments\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEstablishmentRequest extends FormRequest
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
        $establishment = $this->route('establishment');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'cnpj' => ['sometimes', 'required', 'digits:14', Rule::unique('establishments', 'cnpj')->ignore($establishment)],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'description' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
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
