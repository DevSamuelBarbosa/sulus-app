<?php

namespace Tests\Feature\Employees;

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_company_employees(): void
    {
        $this->getJson('/api/company/employees')->assertUnauthorized();
    }

    public function test_non_company_role_cannot_access_company_employees(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/company/employees')->assertForbidden();
    }

    public function test_company_lists_only_its_own_employees(): void
    {
        $company = Company::factory()->create();
        $other = Company::factory()->create();
        Employee::factory()->count(2)->for($company)->create();
        Employee::factory()->for($other)->create();

        Sanctum::actingAs($company->user);

        $this->getJson('/api/company/employees')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_company_can_filter_employees_by_status(): void
    {
        $company = Company::factory()->create();
        Employee::factory()->for($company)->create();
        Employee::factory()->for($company)->cancelled()->create();

        Sanctum::actingAs($company->user);

        $this->getJson('/api/company/employees?status=cancelled')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.benefit_status', 'cancelled');
    }

    public function test_company_can_create_an_employee_with_login(): void
    {
        $company = Company::factory()->create();
        Sanctum::actingAs($company->user);

        $this->postJson('/api/company/employees', [
            'email' => 'func@empresa.test',
            'password' => 'password123',
            'full_name' => 'João da Silva',
            'cpf' => '12345678901',
            'phone' => '(54) 99999-0000',
        ])->assertCreated()
            ->assertJsonPath('data.full_name', 'João da Silva')
            ->assertJsonPath('data.login_email', 'func@empresa.test')
            ->assertJsonPath('data.benefit_status', 'active');

        $this->assertDatabaseHas('users', ['email' => 'func@empresa.test', 'role' => 'employee']);
        $this->assertDatabaseHas('employees', ['cpf' => '12345678901', 'company_id' => $company->id]);
    }

    public function test_creating_an_employee_requires_unique_cpf_and_email(): void
    {
        $company = Company::factory()->create();
        $existing = Employee::factory()->for($company)->create(['cpf' => '99999999999']);
        Sanctum::actingAs($company->user);

        $this->postJson('/api/company/employees', [
            'email' => $existing->user->email,
            'password' => 'password123',
            'full_name' => 'Duplicado',
            'cpf' => '99999999999',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'cpf']);
    }

    public function test_company_cannot_access_another_companies_employee(): void
    {
        $company = Company::factory()->create();
        $other = Company::factory()->create();
        $foreign = Employee::factory()->for($other)->create();

        Sanctum::actingAs($company->user);

        $this->getJson("/api/company/employees/{$foreign->id}")->assertNotFound();
        $this->putJson("/api/company/employees/{$foreign->id}", ['full_name' => 'Hack'])->assertNotFound();
        $this->deleteJson("/api/company/employees/{$foreign->id}")->assertNotFound();
    }

    public function test_company_can_update_an_employee(): void
    {
        $company = Company::factory()->create();
        $employee = Employee::factory()->for($company)->create();
        Sanctum::actingAs($company->user);

        $this->putJson("/api/company/employees/{$employee->id}", [
            'full_name' => 'Nome Atualizado',
            'phone' => '(54) 98888-1111',
        ])->assertOk()->assertJsonPath('data.full_name', 'Nome Atualizado');

        $this->assertDatabaseHas('employees', ['id' => $employee->id, 'full_name' => 'Nome Atualizado']);
        // Login user's display name is kept in sync.
        $this->assertDatabaseHas('users', ['id' => $employee->user_id, 'name' => 'Nome Atualizado']);
    }

    public function test_company_can_cancel_and_reactivate_benefit(): void
    {
        $company = Company::factory()->create();
        $employee = Employee::factory()->for($company)->create();
        Sanctum::actingAs($company->user);

        $this->patchJson("/api/company/employees/{$employee->id}/cancel-benefit")
            ->assertOk()->assertJsonPath('data.benefit_status', 'cancelled');
        $this->assertDatabaseHas('employees', ['id' => $employee->id, 'benefit_status' => 'cancelled']);

        $this->patchJson("/api/company/employees/{$employee->id}/reactivate-benefit")
            ->assertOk()->assertJsonPath('data.benefit_status', 'active');
        $this->assertDatabaseHas('employees', ['id' => $employee->id, 'benefit_status' => 'active']);
    }

    public function test_deleting_an_employee_soft_deletes_and_deactivates_login(): void
    {
        $company = Company::factory()->create();
        $employee = Employee::factory()->for($company)->create();
        Sanctum::actingAs($company->user);

        $this->deleteJson("/api/company/employees/{$employee->id}")->assertNoContent();

        $this->assertSoftDeleted('employees', ['id' => $employee->id]);
        $this->assertDatabaseHas('users', ['id' => $employee->user_id, 'is_active' => false]);
    }

    public function test_company_can_upload_an_employee_photo(): void
    {
        Storage::fake('public');
        $company = Company::factory()->create();
        $employee = Employee::factory()->for($company)->create();
        Sanctum::actingAs($company->user);

        // fake()->image() needs the GD extension; a fake file with an image
        // MIME exercises the same validation path without it.
        $response = $this->postJson("/api/company/employees/{$employee->id}/photo", [
            'photo' => UploadedFile::fake()->create('foto.jpg', 500, 'image/jpeg'),
        ]);

        $response->assertOk();
        $this->assertNotNull($response->json('data.photo_url'));

        $employee->refresh();
        $this->assertNotNull($employee->photo_path);
        Storage::disk('public')->assertExists($employee->photo_path);
    }

    public function test_photo_upload_rejects_non_image(): void
    {
        Storage::fake('public');
        $company = Company::factory()->create();
        $employee = Employee::factory()->for($company)->create();
        Sanctum::actingAs($company->user);

        $this->postJson("/api/company/employees/{$employee->id}/photo", [
            'photo' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertUnprocessable()->assertJsonValidationErrors('photo');
    }
}
