<?php

namespace Tests\Feature\Employees;

use App\Models\Company;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmployeeProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_employee_profile(): void
    {
        $this->getJson('/api/employee/profile')->assertUnauthorized();
    }

    public function test_employee_sees_the_company_they_belong_to(): void
    {
        $company = Company::factory()->create(['trade_name' => 'Padaria Bom Pão']);
        $employee = Employee::factory()->for($company)->create();

        Sanctum::actingAs($employee->user);

        $this->getJson('/api/employee/profile')
            ->assertOk()
            ->assertJsonPath('employee.full_name', $employee->full_name)
            ->assertJsonPath('company.trade_name', 'Padaria Bom Pão');
    }
}
