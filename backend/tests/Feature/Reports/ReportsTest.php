<?php

namespace Tests\Feature\Reports;

use App\Enums\UserRole;
use App\Models\BenefitUsage;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    private function makeUsage(Employee $employee, Establishment $establishment, ?\DateTimeInterface $usedAt = null): BenefitUsage
    {
        return BenefitUsage::create([
            'employee_id' => $employee->id,
            'company_id' => $employee->company_id,
            'establishment_id' => $establishment->id,
            'validated_by_user_id' => $establishment->user_id,
            'used_at' => $usedAt ?? now(),
            'employee_name_snapshot' => $employee->full_name,
            'company_name_snapshot' => $employee->company->trade_name ?? $employee->company->legal_name,
        ]);
    }

    // -- Employee usages --------------------------------------------------

    public function test_guest_cannot_list_employee_usages(): void
    {
        $this->getJson('/api/employee/usages')->assertUnauthorized();
    }

    public function test_employee_only_sees_their_own_usages(): void
    {
        $employee = Employee::factory()->create();
        $otherEmployee = Employee::factory()->create();
        $establishment = Establishment::factory()->create();

        $this->makeUsage($employee, $establishment);
        $this->makeUsage($otherEmployee, $establishment);

        Sanctum::actingAs($employee->user);

        $this->getJson('/api/employee/usages')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.employee_name', $employee->full_name);
    }

    // -- Company usages & reports ------------------------------------------

    public function test_company_cannot_see_another_companys_usages(): void
    {
        $companyA = Company::factory()->create();
        $employeeA = Employee::factory()->create(['company_id' => $companyA->id]);
        $employeeB = Employee::factory()->create();
        $establishment = Establishment::factory()->create();

        $this->makeUsage($employeeA, $establishment);
        $this->makeUsage($employeeB, $establishment);

        Sanctum::actingAs($companyA->user);

        $this->getJson('/api/company/usages')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.employee_name', $employeeA->full_name);
    }

    public function test_company_can_search_usages_by_employee_name(): void
    {
        $company = Company::factory()->create();
        $maria = Employee::factory()->create(['company_id' => $company->id, 'full_name' => 'Maria Souza']);
        $joao = Employee::factory()->create(['company_id' => $company->id, 'full_name' => 'João Lima']);
        $establishment = Establishment::factory()->create();

        $this->makeUsage($maria, $establishment);
        $this->makeUsage($joao, $establishment);

        Sanctum::actingAs($company->user);

        $this->getJson('/api/company/usages?search=Maria')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.employee_name', 'Maria Souza');
    }

    public function test_employee_role_cannot_access_company_reports(): void
    {
        Sanctum::actingAs(User::factory()->role(UserRole::Employee)->create());

        $this->getJson('/api/company/reports')->assertForbidden();
    }

    public function test_company_reports_return_totals_and_top_establishments(): void
    {
        $company = Company::factory()->create();
        $active = Employee::factory()->create(['company_id' => $company->id]);
        Employee::factory()->cancelled()->create(['company_id' => $company->id]);
        $establishment = Establishment::factory()->create(['name' => 'Farmácia Central']);

        $this->makeUsage($active, $establishment);
        $this->makeUsage($active, $establishment);

        Sanctum::actingAs($company->user);

        $this->getJson('/api/company/reports')
            ->assertOk()
            ->assertJsonPath('data.total_usages', 2)
            ->assertJsonPath('data.usages_this_month', 2)
            ->assertJsonPath('data.active_employees_count', 1)
            ->assertJsonPath('data.top_establishments.0.name', 'Farmácia Central')
            ->assertJsonPath('data.top_establishments.0.count', 2);
    }

    // -- Establishment usages & reports -------------------------------------

    public function test_establishment_cannot_see_another_establishments_usages(): void
    {
        $establishmentA = Establishment::factory()->create();
        $establishmentB = Establishment::factory()->create();
        $employee = Employee::factory()->create();

        $this->makeUsage($employee, $establishmentA);
        $this->makeUsage($employee, $establishmentB);

        Sanctum::actingAs($establishmentA->user);

        $this->getJson('/api/establishment/usages')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_establishment_reports_return_totals_and_top_companies(): void
    {
        $establishment = Establishment::factory()->create();
        $company = Company::factory()->create(['trade_name' => 'Empresa Demo']);
        $employee = Employee::factory()->create(['company_id' => $company->id]);

        $this->makeUsage($employee, $establishment);
        $this->makeUsage($employee, $establishment);

        Sanctum::actingAs($establishment->user);

        $this->getJson('/api/establishment/reports')
            ->assertOk()
            ->assertJsonPath('data.total_usages', 2)
            ->assertJsonPath('data.unique_companies_count', 1)
            ->assertJsonPath('data.top_companies.0.name', 'Empresa Demo')
            ->assertJsonPath('data.top_companies.0.count', 2);
    }

    // -- Admin reports --------------------------------------------------------

    public function test_non_admin_cannot_access_admin_reports(): void
    {
        Sanctum::actingAs(Company::factory()->create()->user);

        $this->getJson('/api/admin/reports')->assertForbidden();
    }

    public function test_admin_reports_return_global_totals(): void
    {
        $employee = Employee::factory()->create();
        $establishment = Establishment::factory()->create();
        $this->makeUsage($employee, $establishment);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.total_usages', 1)
            ->assertJsonStructure(['data' => ['total_usages', 'usages_this_month', 'top_companies', 'top_establishments']]);
    }
}
