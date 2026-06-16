<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_id')->unique();
            $table->string('nama_proyek')->unique();
            $table->string('lokasi')->nullable();
            $table->string('client')->nullable();
            $table->string('product_manager')->nullable();
            $table->date('target_selesai')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('status')->default('Perencanaan');
            $table->string('nilai_kontrak')->nullable();
            $table->timestamps();
        });

        DB::table('projects')->insert([
            [
                'project_id' => 'PRJ-240501',
                'nama_proyek' => 'Java Water Pool',
                'lokasi' => 'Uluwatu, Bali',
                'client' => 'Villa Samudra Management',
                'product_manager' => 'Dzaiki Zein',
                'target_selesai' => '2026-06-30',
                'progress' => 36,
                'status' => 'Aktif',
                'nilai_kontrak' => 'Rp 185.000.000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'project_id' => 'PRJ-240502',
                'nama_proyek' => 'Aqua Bliss Pool',
                'lokasi' => 'Sanur, Bali',
                'client' => 'Blue Lagoon Hospitality',
                'product_manager' => 'Dzaiki Zein',
                'target_selesai' => '2026-07-12',
                'progress' => 58,
                'status' => 'Aktif',
                'nilai_kontrak' => 'Rp 142.000.000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'project_id' => 'PRJ-240503',
                'nama_proyek' => 'Tirta Prima Pool Care',
                'lokasi' => 'Denpasar, Bali',
                'client' => 'Tirta Kencana Club',
                'product_manager' => 'Dzaiki Zein',
                'target_selesai' => '2026-05-26',
                'progress' => 14,
                'status' => 'Perencanaan',
                'nilai_kontrak' => 'Rp 760.000.000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'project_id' => 'PRJ-240504',
                'nama_proyek' => 'Blue Wave Pool Solutions',
                'lokasi' => 'Badung, Bali',
                'client' => 'AquaFit Sports Center',
                'product_manager' => 'Dzaiki Zein',
                'target_selesai' => '2026-08-18',
                'progress' => 42,
                'status' => 'Tertunda',
                'nilai_kontrak' => 'Rp 54.000.000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
