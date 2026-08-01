<?php

namespace App\Modules\Companies\Services;

use App\Models\Company;
use App\Models\Employee;
use App\Modules\Companies\Exceptions\SelfRegistrationTokenInvalidException;
use App\Modules\Employees\Services\EmployeeService;

/**
 * Public side of a company's self-registration link: resolving the token
 * and creating the employee. See SelfRegistrationLinkService for the
 * authenticated generate/revoke side.
 */
class SelfRegistrationService
{
    public function __construct(private readonly EmployeeService $employees) {}

    /**
     * @return array{trade_name: string}
     */
    public function inspect(string $token): array
    {
        return ['trade_name' => $this->resolve($token)->trade_name];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function register(string $token, array $data): Employee
    {
        $company = $this->resolve($token);

        return $this->employees->registerViaSelfRegistration($company, $data);
    }

    private function resolve(string $token): Company
    {
        // is_active is checked explicitly: unlike company/establishment
        // logins, an employee's access isn't gated by their company's
        // active status anywhere else, so a suspended company's leftover
        // link would otherwise keep onboarding new employees indefinitely.
        // Soft-deleted companies are already excluded by the default
        // SoftDeletes global scope.
        $company = Company::where('self_registration_token', $token)
            ->where('self_registration_token_expires_at', '>', now())
            ->where('is_active', true)
            ->first();

        if (! $company) {
            throw new SelfRegistrationTokenInvalidException;
        }

        return $company;
    }
}
