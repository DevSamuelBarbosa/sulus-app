<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('benefit_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('validated_by_user_id')->constrained('users');
            $table->timestamp('used_at');
            $table->string('employee_name_snapshot');
            $table->string('company_name_snapshot');
            $table->timestamp('created_at')->nullable();

            $table->index(['company_id', 'used_at']);
            $table->index(['establishment_id', 'used_at']);
            $table->index(['employee_id', 'used_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('benefit_usages');
    }
};
