<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
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
        // Deliberately no `exists:users,email` — a validation error here
        // would reveal whether the address is registered.
        return [
            'email' => ['required', 'email'],
        ];
    }
}
