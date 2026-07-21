<?php

namespace Tests\Feature\Establishments;

use App\Enums\TenantRole;
use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tenantUser(Establishment $establishment, TenantRole $role): User
    {
        return User::factory()->for($establishment)->create([
            'role' => UserRole::Establishment,
            'tenant_role' => $role,
        ]);
    }

    public function test_administrador_can_create_a_login(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($this->tenantUser($establishment, TenantRole::Administrador));

        $this->postJson('/api/establishment/users', [
            'name' => 'Novo Login',
            'email' => 'novo@estabelecimento.test',
            'password' => 'password123',
            'tenant_role' => 'normal',
        ])->assertCreated()->assertJsonPath('data.tenant_role', 'normal');
    }

    public function test_normal_user_is_blocked_from_managing_logins(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($this->tenantUser($establishment, TenantRole::Normal));

        $this->getJson('/api/establishment/users')->assertForbidden();
    }

    public function test_promote_master_transfers_ownership(): void
    {
        $establishment = Establishment::factory()->create();
        $master = $establishment->masterUser;
        $administrador = $this->tenantUser($establishment, TenantRole::Administrador);
        Sanctum::actingAs($master);

        $this->patchJson("/api/establishment/users/{$administrador->id}/promote-master", ['password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.tenant_role', 'master');

        $this->assertDatabaseHas('users', ['id' => $master->id, 'tenant_role' => 'administrador']);
        $this->assertDatabaseHas('users', ['id' => $administrador->id, 'tenant_role' => 'master']);
    }

    public function test_cannot_remove_the_only_master(): void
    {
        $establishment = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->deleteJson("/api/establishment/users/{$establishment->masterUser->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['user']);
    }

    public function test_cannot_manage_logins_of_another_establishment(): void
    {
        $establishment = Establishment::factory()->create();
        $other = Establishment::factory()->create();
        Sanctum::actingAs($establishment->masterUser);

        $this->putJson("/api/establishment/users/{$other->masterUser->id}", ['name' => 'Hijack'])
            ->assertNotFound();
    }
}
