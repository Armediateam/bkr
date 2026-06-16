<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_report_submissions', function (Blueprint $table) {
            $table->index(['tanggal', 'created_at'], 'daily_reports_tanggal_created_at_idx');
            $table->index('nama_proyek', 'daily_reports_nama_proyek_idx');
            $table->index('status', 'daily_reports_status_idx');
            $table->index('submitted_by', 'daily_reports_submitted_by_idx');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('status', 'projects_status_idx');
            $table->index('product_manager', 'projects_product_manager_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'name'], 'users_role_name_idx');
        });
    }

    public function down(): void
    {
        Schema::table('daily_report_submissions', function (Blueprint $table) {
            $table->dropIndex('daily_reports_tanggal_created_at_idx');
            $table->dropIndex('daily_reports_nama_proyek_idx');
            $table->dropIndex('daily_reports_status_idx');
            $table->dropIndex('daily_reports_submitted_by_idx');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_status_idx');
            $table->dropIndex('projects_product_manager_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_name_idx');
        });
    }
};
