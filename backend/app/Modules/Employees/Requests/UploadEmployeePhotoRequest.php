<?php

namespace App\Modules\Employees\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadEmployeePhotoRequest extends FormRequest
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
            'photo' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:'.config('media.photo_max_kb'),
            ],
        ];
    }
}
