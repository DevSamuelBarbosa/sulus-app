<?php

namespace App\Modules\Employees\Resources;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Employee
 */
class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'login_email' => $this->whenLoaded('user', fn () => $this->user->email),
            'full_name' => $this->full_name,
            'cpf' => $this->cpf,
            'phone' => $this->phone,
            'photo_url' => $this->photoUrl(),
            'benefit_status' => $this->benefit_status->value,
            'benefit_status_label' => $this->benefit_status->label(),
            'hired_at' => $this->hired_at?->toDateString(),
            'created_at' => $this->created_at,
        ];
    }
}
