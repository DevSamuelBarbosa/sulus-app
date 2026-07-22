<?php

namespace App\Modules\Employees\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
            // Login user for the employee (used later to generate the QR code).
            // No password here — the employee sets their own via the
            // activation email (see EmployeeActivationService).
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],

            // Employee profile.
            'full_name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'digits:11', 'unique:employees,cpf'],
            'phone' => ['nullable', 'string', 'max:30'],
            'hired_at' => ['nullable', 'date'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
        ];
    }
}
