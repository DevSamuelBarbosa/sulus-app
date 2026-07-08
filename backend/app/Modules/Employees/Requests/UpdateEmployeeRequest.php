<?php

namespace App\Modules\Employees\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
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
        $employee = $this->route('employee');

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'cpf' => ['sometimes', 'required', 'digits:11', Rule::unique('employees', 'cpf')->ignore($employee)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'hired_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
