<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_number')->unique();
            $table->string('name');
            $table->string('position')->nullable();
            $table->string('employment_status', 20)->default('TETAP');
            $table->string('tax_status', 10)->default('TK0');
            $table->string('npwp')->nullable();
            $table->unsignedBigInteger('base_salary')->default(0);
            $table->unsignedBigInteger('allowance')->default(0);
            $table->unsignedBigInteger('daily_rate')->default(0);
            $table->unsignedTinyInteger('dependents')->default(0);
            $table->boolean('bpjs_health_enabled')->default(true);
            $table->boolean('bpjs_employment_enabled')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->string('period_label');
            $table->string('status', 30)->default('Siap Bayar');
            $table->date('processed_at');
            $table->text('note')->nullable();
            $table->unsignedBigInteger('gross_total')->default(0);
            $table->unsignedBigInteger('bpjs_total')->default(0);
            $table->unsignedBigInteger('pph21_total')->default(0);
            $table->unsignedBigInteger('net_total')->default(0);
            $table->timestamps();

            $table->unique(['month', 'year']);
        });

        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_employee_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_number');
            $table->string('employee_name');
            $table->string('position')->nullable();
            $table->string('tax_status', 10)->default('TK0');
            $table->string('npwp')->nullable();
            $table->unsignedBigInteger('ptkp')->default(54000000);
            $table->unsignedBigInteger('base_salary')->default(0);
            $table->unsignedBigInteger('allowance')->default(0);
            $table->unsignedBigInteger('meal')->default(0);
            $table->unsignedBigInteger('transport')->default(0);
            $table->unsignedBigInteger('bonus')->default(0);
            $table->unsignedBigInteger('other_income')->default(0);
            $table->unsignedBigInteger('gross')->default(0);
            $table->unsignedBigInteger('bpjs_health_employee')->default(0);
            $table->unsignedBigInteger('bpjs_employment_employee')->default(0);
            $table->unsignedBigInteger('bpjs_health_company')->default(0);
            $table->unsignedBigInteger('bpjs_employment_company')->default(0);
            $table->unsignedBigInteger('pph21')->default(0);
            $table->unsignedBigInteger('net_pay')->default(0);
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('budget_targets', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->unsignedBigInteger('target_revenue')->default(0);
            $table->unsignedBigInteger('actual_revenue')->default(0);
            $table->timestamps();

            $table->unique(['month', 'year']);
        });

        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_target_id')->constrained()->cascadeOnDelete();
            $table->string('account_code', 20);
            $table->string('account_name');
            $table->unsignedBigInteger('budget')->default(0);
            $table->unsignedBigInteger('actual')->default(0);
            $table->timestamps();

            $table->unique(['budget_target_id', 'account_code']);
        });

        Schema::create('advanced_module_settings', function (Blueprint $table) {
            $table->id();
            $table->string('module_key')->unique();
            $table->string('name');
            $table->boolean('active')->default(false);
            $table->string('serial')->nullable();
            $table->json('features')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advanced_module_settings');
        Schema::dropIfExists('budget_lines');
        Schema::dropIfExists('budget_targets');
        Schema::dropIfExists('payroll_items');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('payroll_employees');
    }
};
