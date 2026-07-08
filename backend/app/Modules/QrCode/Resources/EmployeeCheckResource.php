<?php

namespace App\Modules\QrCode\Resources;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Minimal payload for the establishment's visual conference at the counter:
 * just enough to match the person in front of them (photo/name) against
 * their benefit provider — never CPF or other sensitive fields.
 *
 * @mixin Employee
 */
class EmployeeCheckResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'full_name' => $this->full_name,
            'photo_url' => $this->photoUrl(),
            'company_name' => $this->company->trade_name ?? $this->company->legal_name,
        ];
    }
}
