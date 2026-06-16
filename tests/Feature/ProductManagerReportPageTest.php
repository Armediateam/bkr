<?php

use App\Models\DailyReportSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('product manager report page only shows reports owned by the authenticated product manager', function () {
    $loggedInProductManager = User::factory()->create([
        'role' => 'product_manager',
        'name' => 'PM Login',
    ]);

    $otherProductManager = User::factory()->create([
        'role' => 'product_manager',
        'name' => 'PM Lain',
    ]);

    DailyReportSubmission::query()->create([
        'submitted_by' => $loggedInProductManager->id,
        'report_id' => 'LHR-OWN-001',
        'tanggal' => now()->toDateString(),
        'nama_proyek' => 'Proyek PM Login',
        'shift' => 'Pagi',
        'status' => 'Submitted',
        'payload' => [
            'progress' => 60,
            'jumlahTukangHariIni' => '8',
            'namaTukangIzinPagi' => [],
            'teleponKepalaTukangPagi' => 'YA',
            'catatanKepalaTukangPagi' => '',
            'prakiraanCuaca' => 'Cerah',
            'pekerjaanUtamaHariIni' => 'Pekerjaan milik PM login',
            'rencanaPekerjaanHariIni' => [],
            'rencanaMaterialHariIni' => '',
            'materialDatangHariIni' => [],
            'cctvJam8' => '',
            'tukangSakitSetengahHari' => '',
            'namaTukangIzinSiang' => [],
            'teleponKepalaTukangSiang' => 'BELUM',
            'catatanKepalaTukangSiang' => '',
            'statusPekerjaanSiang' => [],
            'penyebabPekerjaanSiang' => '',
            'statusMaterialDatangSiang' => [],
            'uploadSuratJalan' => '',
            'teleponMaterialLusa' => 'BELUM',
            'kebutuhanMaterialLusa' => [],
            'cctvJam10' => '',
            'cctvJam12' => '',
            'teleponKepalaTukangSore' => 'BELUM',
            'catatanKepalaTukangSore' => '',
            'statusPekerjaanSore' => '',
            'uploadFotoHasil' => '',
            'penyebabPekerjaanSore' => '',
            'orderMaterialSiang' => 'BELUM',
            'materialHarga' => [],
            'fotoNota' => '',
            'kendalaKerjaHariIni' => '',
            'targetUtamaBesok' => '',
            'statusMaterialBesok' => '',
            'cctvJam14' => '',
            'cctvJam16' => '',
            'rincianPengeluaranKas' => [],
            'kasbonTukang' => [],
        ],
    ]);

    DailyReportSubmission::query()->create([
        'submitted_by' => $otherProductManager->id,
        'report_id' => 'LHR-OTHER-001',
        'tanggal' => now()->subDay()->toDateString(),
        'nama_proyek' => 'Proyek PM Lain',
        'shift' => 'Siang',
        'status' => 'Submitted',
        'payload' => [
            'progress' => 80,
            'jumlahTukangHariIni' => '10',
            'namaTukangIzinPagi' => [],
            'teleponKepalaTukangPagi' => 'YA',
            'catatanKepalaTukangPagi' => '',
            'prakiraanCuaca' => 'Berawan',
            'pekerjaanUtamaHariIni' => 'Pekerjaan milik PM lain',
            'rencanaPekerjaanHariIni' => [],
            'rencanaMaterialHariIni' => '',
            'materialDatangHariIni' => [],
            'cctvJam8' => '',
            'tukangSakitSetengahHari' => '',
            'namaTukangIzinSiang' => [],
            'teleponKepalaTukangSiang' => 'BELUM',
            'catatanKepalaTukangSiang' => '',
            'statusPekerjaanSiang' => [],
            'penyebabPekerjaanSiang' => '',
            'statusMaterialDatangSiang' => [],
            'uploadSuratJalan' => '',
            'teleponMaterialLusa' => 'BELUM',
            'kebutuhanMaterialLusa' => [],
            'cctvJam10' => '',
            'cctvJam12' => '',
            'teleponKepalaTukangSore' => 'BELUM',
            'catatanKepalaTukangSore' => '',
            'statusPekerjaanSore' => '',
            'uploadFotoHasil' => '',
            'penyebabPekerjaanSore' => '',
            'orderMaterialSiang' => 'BELUM',
            'materialHarga' => [],
            'fotoNota' => '',
            'kendalaKerjaHariIni' => '',
            'targetUtamaBesok' => '',
            'statusMaterialBesok' => '',
            'cctvJam14' => '',
            'cctvJam16' => '',
            'rincianPengeluaranKas' => [],
            'kasbonTukang' => [],
        ],
    ]);

    $this->actingAs($loggedInProductManager)
        ->get(route('product-manager.laporan'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('product-manager/laporan')
            ->has('reports', 1)
            ->where('reports.0.id', 'LHR-OWN-001')
            ->where('reports.0.productManager', 'PM Login')
            ->missing('reports.1'));
});
