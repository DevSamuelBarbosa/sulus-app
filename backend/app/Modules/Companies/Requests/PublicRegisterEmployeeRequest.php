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

            // Employee profile.
            'full_name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'digits:11', 'unique:employees,cpf'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
        ];
    }
}
