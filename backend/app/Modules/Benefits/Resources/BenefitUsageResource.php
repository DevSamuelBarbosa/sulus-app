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
            // Not snapshotted (see benefit_usages migration) — establishments
            // aren't expected to rename often, so the current name is fine here.
            'establishment_name' => $this->whenLoaded('establishment', fn () => $this->establishment?->name),
            'used_at' => $this->used_at,
        ];
    }
}
