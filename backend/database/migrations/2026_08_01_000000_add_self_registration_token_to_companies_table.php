<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('self_registration_token')->nullable()->unique()->after('is_active');
            $table->timestamp('self_registration_token_expires_at')->nullable()->after('self_registration_token');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['self_registration_token', 'self_registration_token_expires_at']);
        });
    }
};
