<?php

namespace Tests\Feature\Establishments;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function tenantUser(Establishment $establishment, TenantRole $role): User
    {
        return User::factory()->for($establishment)->create([
            'role' => UserRole::Establishment,
            'tenant_role' => $role,
        ]);
    }

    public function test_master_can_update_cnpj_with_correct_password(): void
    {
        $establishment = Establishment::factory()->create(['cnpj' => '11111111000111']);
        Sanctum::actingAs($establishment->masterUser);

        $this->patchJson('/api/establishment/settings', [
            'cnpj' => '22222222000122',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.cnpj', '22222222000122');
    }

    public function test_updating_settings_with_wrong_password_fails(): void
    {
        $establishment = Establishment::factory()->create(['cnpj' => '11111111000111']);
        Sanctum::actingAs($establishment->masterUser);

        $this->patchJson('/api/establishment/settings', [
            'cnpj' => '22222222000122',
            'password' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_administrador_cannot_update_settings(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($this->tenantUser($establishment, TenantRole::Administrador));

        $this->patchJson('/api/establishment/settings', [
            'cnpj' => '22222222000122',
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_master_can_delete_the_account_with_correct_password(): void
    {
        $establishment = Establishment::factory()->create();
        $master = $establishment->masterUser;
        Sanctum::actingAs($master);

        $this->deleteJson('/api/establishment', ['password' => 'password'])->assertNoContent();

        $this->assertSoftDeleted('establishments', ['id' => $establishment->id]);
        $this->assertDatabaseHas('users', ['id' => $master->id, 'is_active' => false]);
    }
}
