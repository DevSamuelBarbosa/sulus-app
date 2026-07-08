<?php

namespace App\Modules\Benefits\Services;

use App\Models\BenefitUsage;
use App\Models\Employee;
use App\Models\User;
use App\Modules\QrCode\Exceptions\BenefitInactiveException;
use App\Modules\QrCode\Services\QrTokenService;

class BenefitService
{
    public function __construct(private readonly QrTokenService $qrTokens) {}

    /**
     * Consume the confirmation_ref minted by QrTokenService::validate and
     * persist the redemption. The confirmation_ref is single-use, so this can
     * register at most one usage per scan.
     */
    public function registerUsage(string $confirmationRef, User $establishmentUser): BenefitUsage
    {
        $confirmed = $this->qrTokens->consumeConfirmation($confirmationRef);
        $employee = Employee::with('company')->findOrFail($confirmed['employee_id']);

        // Re-check: the benefit may have been cancelled between the scan and
        // this confirmation (e.g. company cancels it in the same window).
        if (! $employee->hasActiveBenefit()) {
            throw new BenefitInactiveException;
        }

        $usage = BenefitUsage::create([
            'employee_id' => $employee->id,
            'company_id' => $employee->company_id,
            'establishment_id' => $establishmentUser->establishment->id,
            'validated_by_user_id' => $establishmentUser->id,
            'used_at' => now(),
            'employee_name_snapshot' => $employee->full_name,
            'company_name_snapshot' => $employee->company->trade_name ?? $employee->company->legal_name,
        ]);

        $this->qrTokens->markUsed($confirmed['token'], $employee->id);

        return $usage;
    }
}
