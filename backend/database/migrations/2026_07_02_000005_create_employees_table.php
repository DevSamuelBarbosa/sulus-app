<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('cpf', 11)->unique();
            $table->string('photo_path')->nullable();
            $table->string('phone')->nullable();
            $table->string('benefit_status')->default('active')->index();
            $table->date('hired_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
