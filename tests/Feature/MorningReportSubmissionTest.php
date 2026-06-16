<?php

use App\Models\DailyReportSubmission;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores a morning report submission in the database', function () {
    $user = User::factory()->create([
        'role' => 'product_manager',
    ]);

    $project = Project::query()->create([
        'project_id' => 'PRJ-TEST-001',
        'nama_proyek' => 'Proyek Test Laporan Pagi',
        'status' => 'Aktif',
        'progress' => 55,
    ]);

    $response = $this->actingAs($user)->post(route('product-manager.laporan.store'), [
        'tanggal' => now()->toDateString(),
        'namaProyek' => $project->nama_proyek,
        'progress' => 65,
        'shift' => 'Pagi',
        'jumlahTukangHariIni' => '8',
        'namaTukangIzinPagi' => ['Dedi', 'Nihil', 'Nihil'],
        'teleponKepalaTukangPagi' => 'YA',
        'catatanKepalaTukangPagi' => 'Koordinasi pagi sudah dilakukan.',
        'prakiraanCuaca' => 'Cerah',
        'pekerjaanUtamaHariIni' => 'Pemasangan bekisting',
        'rencanaPekerjaanHariIni' => [
            [
                'itemPekerjaan' => 'Pasang bekisting kolom',
                'volume' => '12 titik',
                'jumlahPekerja' => '4',
            ],
        ],
        'rencanaMaterialHariIni' => 'Kayu, paku, kawat bendrat',
        'materialDatangHariIni' => [
            [
                'material' => 'Kayu',
                'jumlah' => '20',
                'satuan' => 'batang',
                'eta' => '09:00',
            ],
        ],
        'statusPekerjaanSiang' => [],
        'statusMaterialDatangSiang' => [],
        'kebutuhanMaterialLusa' => [],
        'materialHarga' => [],
        'rincianPengeluaranKas' => [],
        'kasbonTukang' => [],
    ]);

    $response
        ->assertRedirect(route('product-manager.laporan'))
        ->assertSessionHas('success');

    expect(DailyReportSubmission::query()->count())->toBe(1);

    $submission = DailyReportSubmission::query()->firstOrFail();
    $project->refresh();

    expect($submission->submitted_by)->toBe($user->id)
        ->and($submission->nama_proyek)->toBe($project->nama_proyek)
        ->and($submission->shift)->toBe('Pagi')
        ->and($submission->status)->toBe('Submitted')
        ->and($submission->payload['progress'])->toBe(65)
        ->and($submission->payload['jumlahTukangHariIni'])->toBe('8')
        ->and($submission->payload['pekerjaanUtamaHariIni'])->toBe('Pemasangan bekisting')
        ->and($submission->payload['rencanaPekerjaanHariIni'][0]['itemPekerjaan'])->toBe('Pasang bekisting kolom')
        ->and($project->progress)->toBe(65)
        ->and($project->product_manager)->toBe($user->name);
});
