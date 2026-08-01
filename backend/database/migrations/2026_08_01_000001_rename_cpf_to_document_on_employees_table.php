<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Employees can now be identified by CPF (11 digits) or CNPJ (14
 * alphanumeric chars, for pessoa jurídica employees) — see
 * StoreEmployeeRequest. Raw SQL is used instead of Schema::change()/
 * renameColumn() since doctrine/dbal isn't installed in this app.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE employees RENAME COLUMN cpf TO document');
        DB::statement('ALTER TABLE employees ALTER COLUMN document TYPE VARCHAR(14)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE employees ALTER COLUMN document TYPE VARCHAR(11)');
        DB::statement('ALTER TABLE employees RENAME COLUMN document TO cpf');
    }
};
