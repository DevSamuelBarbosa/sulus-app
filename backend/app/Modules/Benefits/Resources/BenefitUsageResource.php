<?php

namespace App\Modules\Benefits\Resources;

use App\Models\BenefitUsage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BenefitUsage */
class BenefitUsageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_name' => $this->employee_name_snapshot,
            'company_name' => $this->company_name_snapshot,
            'used_at' => $this->used_at,
        ];
    }
}
