<?php

namespace Tests\Feature\Benefits;

use App\Models\BenefitUsage;
use App\Models\Employee;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BenefitUsageTest extends TestCase
{
    use RefreshDatabase;

    private function scanAndValidate(Employee $employee, Establishment $establishment): string
    {
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        Sanctum::actingAs($establishment->user);

        return $this->postJson('/api/qrcode/validate', ['token' => $token])->json('confirmation_ref');
    }

    public function test_guest_cannot_register_a_usage(): void
    {
        $this->postJson('/api/benefits/usages', ['confirmation_ref' => 'anything'])->assertUnauthorized();
    }

    public function test_non_establishment_role_cannot_register_a_usage(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/benefits/usages', ['confirmation_ref' => 'anything'])->assertForbidden();
    }

    public function test_establishment_can_register_a_usage_after_a_real_scan(): void
    {
        $employee = Employee::factory()->create(['full_name' => 'Maria Souza']);
        $establishment = Establishment::factory()->create();
        $confirmationRef = $this->scanAndValidate($employee, $establishment);

        Sanctum::actingAs($establishment->user);

        $this->postJson('/api/benefits/usages', ['confirmation_ref' => $confirmationRef])
            ->assertCreated()
            ->assertJsonPath('data.employee_name', 'Maria Souza');

        $this->assertDatabaseHas('benefit_usages', [
            'employee_id' => $employee->id,
            'company_id' => $employee->company_id,
            'establishment_id' => $establishment->id,
            'validated_by_user_id' => $establishment->user_id,
            'employee_name_snapshot' => 'Maria Souza',
        ]);
    }

    public function test_a_confirmation_ref_cannot_register_two_usages(): void
    {
        $employee = Employee::factory()->create();
        $establishment = Establishment::factory()->create();
        $confirmationRef = $this->scanAndValidate($employee, $establishment);

        Sanctum::actingAs($establishment->user);

        $this->postJson('/api/benefits/usages', ['confirmation_ref' => $confirmationRef])->assertCreated();
        $this->postJson('/api/benefits/usages', ['confirmation_ref' => $confirmationRef])
            ->assertStatus(410)
            ->assertJsonPath('code', 'qr_token_invalid');

        $this->assertSame(1, BenefitUsage::count());
    }

    public function test_registering_with_an_unknown_confirmation_ref_fails(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->user);

        $this->postJson('/api/benefits/usages', ['confirmation_ref' => 'does-not-exist'])
            ->assertStatus(410)
            ->assertJsonPath('code', 'qr_token_invalid');
    }

    public function test_registering_fails_if_benefit_was_cancelled_after_the_scan(): void
    {
        $employee = Employee::factory()->create();
        $establishment = Establishment::factory()->create();
        $confirmationRef = $this->scanAndValidate($employee, $establishment);

        $employee->update(['benefit_status' => 'cancelled']);

        Sanctum::actingAs($establishment->user);

        $this->postJson('/api/benefits/usages', ['confirmation_ref' => $confirmationRef])
            ->assertForbidden()
            ->assertJsonPath('code', 'benefit_inactive');

        $this->assertSame(0, BenefitUsage::count());
    }
}
