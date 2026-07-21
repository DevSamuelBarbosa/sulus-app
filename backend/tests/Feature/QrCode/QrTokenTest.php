<?php

namespace Tests\Feature\QrCode;

use App\Models\Employee;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QrTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_generate_a_token(): void
    {
        $this->postJson('/api/qrcode/generate')->assertUnauthorized();
    }

    public function test_non_employee_role_cannot_generate_a_token(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/qrcode/generate')->assertForbidden();
    }

    public function test_employee_with_active_benefit_can_generate_a_token(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);

        $response = $this->postJson('/api/qrcode/generate')
            ->assertCreated()
            ->assertJsonStructure(['token', 'expires_in']);

        $token = $response->json('token');
        $this->assertSame(
            ['employee_id' => $employee->id, 'status' => 'pending'],
            Cache::get('qr:'.$token),
        );
    }

    public function test_employee_with_cancelled_benefit_cannot_generate_a_token(): void
    {
        $employee = Employee::factory()->cancelled()->create();
        Sanctum::actingAs($employee->user);

        $this->postJson('/api/qrcode/generate')
            ->assertForbidden()
            ->assertJsonPath('code', 'benefit_inactive');
    }

    public function test_guest_cannot_validate_a_token(): void
    {
        $this->postJson('/api/qrcode/validate', ['token' => 'anything'])->assertUnauthorized();
    }

    public function test_non_establishment_role_cannot_validate_a_token(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);

        $this->postJson('/api/qrcode/validate', ['token' => 'anything'])->assertForbidden();
    }

    public function test_establishment_can_validate_a_valid_token(): void
    {
        $employee = Employee::factory()->create(['full_name' => 'João da Silva']);
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->postJson('/api/qrcode/validate', ['token' => $token])
            ->assertOk()
            ->assertJsonStructure(['confirmation_ref', 'expires_in', 'employee' => ['full_name', 'photo_url', 'company_name']])
            ->assertJsonPath('employee.full_name', 'João da Silva');
    }

    public function test_validating_an_unknown_token_fails(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->postJson('/api/qrcode/validate', ['token' => 'does-not-exist'])
            ->assertStatus(410)
            ->assertJsonPath('code', 'qr_token_invalid');
    }

    public function test_a_token_cannot_be_validated_twice(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->postJson('/api/qrcode/validate', ['token' => $token])->assertOk();
        $this->postJson('/api/qrcode/validate', ['token' => $token])
            ->assertStatus(410)
            ->assertJsonPath('code', 'qr_token_invalid');
    }

    public function test_validating_a_token_for_a_cancelled_benefit_fails(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        // Benefit gets cancelled after the token was issued but before scan.
        $employee->update(['benefit_status' => 'cancelled']);

        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->postJson('/api/qrcode/validate', ['token' => $token])
            ->assertForbidden()
            ->assertJsonPath('code', 'benefit_inactive');
    }

    public function test_guest_cannot_poll_token_status(): void
    {
        $this->getJson('/api/qrcode/status/anything')->assertUnauthorized();
    }

    public function test_non_employee_role_cannot_poll_token_status(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/qrcode/status/anything')->assertForbidden();
    }

    public function test_status_progresses_from_pending_to_validated(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        $this->getJson("/api/qrcode/status/{$token}")->assertOk()->assertJsonPath('status', 'pending');

        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);
        $this->postJson('/api/qrcode/validate', ['token' => $token])->assertOk();

        Sanctum::actingAs($employee->user);
        $this->getJson("/api/qrcode/status/{$token}")->assertOk()->assertJsonPath('status', 'validated');
    }

    public function test_status_reports_used_once_the_usage_is_registered(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);
        $confirmationRef = $this->postJson('/api/qrcode/validate', ['token' => $token])->json('confirmation_ref');
        $this->postJson('/api/benefits/usages', ['confirmation_ref' => $confirmationRef])->assertCreated();

        Sanctum::actingAs($employee->user);
        $this->getJson("/api/qrcode/status/{$token}")->assertOk()->assertJsonPath('status', 'used');
    }

    public function test_status_for_an_unknown_token_is_expired(): void
    {
        $employee = Employee::factory()->create();
        Sanctum::actingAs($employee->user);

        $this->getJson('/api/qrcode/status/does-not-exist')
            ->assertOk()
            ->assertJsonPath('status', 'expired');
    }

    public function test_employee_cannot_poll_another_employees_token_status(): void
    {
        $owner = Employee::factory()->create();
        Sanctum::actingAs($owner->user);
        $token = $this->postJson('/api/qrcode/generate')->json('token');

        $other = Employee::factory()->create();
        Sanctum::actingAs($other->user);

        $this->getJson("/api/qrcode/status/{$token}")
            ->assertOk()
            ->assertJsonPath('status', 'expired');
    }
}
