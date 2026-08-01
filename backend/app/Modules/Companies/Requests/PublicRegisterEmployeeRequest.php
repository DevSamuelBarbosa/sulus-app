<?php

namespace App\Modules\Companies\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicRegisterEmployeeRequest extends FormRequest
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
            'token' => ['required', 'string'],

            // Login user for the employee.
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],

            // Employee profile. document accepts a CPF (11 digits) or a
            // CNPJ (14 alphanumeric chars, pessoa jurídica) — see
            // Employees\Requests\StoreEmployeeRequest.
            'full_name' => ['required', 'string', 'max:255'],
            'document' => ['required', 'regex:/^(\d{11}|[A-Z0-9]{12}\d{2})$/', 'unique:employees,document'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
        ];
    }
}
