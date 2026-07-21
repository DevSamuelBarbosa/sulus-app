<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Flips company/establishment logins from 1:1 (companies.user_id) to N:1
 * (users.company_id) so a tenant can have multiple logins (Master,
 * Administrador, Usuário Normal). Adds the new columns, backfills them from
 * the existing owner FK (every current owner becomes that tenant's Master),
 * then drops the old columns — safe to run in one pass even on an empty
 * database (the backfill is a no-op). The backfill loops in PHP rather than
 * a single UPDATE ... JOIN so it works on both MySQL (production) and
 * SQLite (the test suite's in-memory driver).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('role')->constrained()->nullOnDelete();
            $table->foreignId('establishment_id')->nullable()->after('company_id')->constrained()->nullOnDelete();
            $table->string('tenant_role')->nullable()->after('establishment_id');
        });

        DB::table('companies')->whereNotNull('user_id')->orderBy('id')
            ->each(fn ($company) => DB::table('users')->where('id', $company->user_id)
                ->update(['company_id' => $company->id, 'tenant_role' => 'master']));

        DB::table('establishments')->whereNotNull('user_id')->orderBy('id')
            ->each(fn ($establishment) => DB::table('users')->where('id', $establishment->user_id)
                ->update(['establishment_id' => $establishment->id, 'tenant_role' => 'master']));

        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('establishments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        Schema::table('establishments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        DB::table('users')->whereNotNull('company_id')->orderBy('id')
            ->each(fn ($user) => DB::table('companies')->where('id', $user->company_id)
                ->update(['user_id' => $user->id]));

        DB::table('users')->whereNotNull('establishment_id')->orderBy('id')
            ->each(fn ($user) => DB::table('establishments')->where('id', $user->establishment_id)
                ->update(['user_id' => $user->id]));

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['establishment_id']);
            $table->dropColumn(['company_id', 'establishment_id', 'tenant_role']);
        });
    }
};
