<?php

namespace Database\Seeders;

use App\Models\DailyReportSubmission;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DailyReportSubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $productManager = User::query()
            ->where('role', 'product_manager')
            ->first();

        if (! $productManager) {
            $productManager = User::query()->firstOrCreate(
                ['email' => 'dzaiki.zein@example.com'],
                [
                    'name' => 'Dzaiki Zein',
                    'role' => 'product_manager',
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ],
            );
        }

        $reports = [
            [
                'report_id' => 'LHR-260508-A1P1',
                'tanggal' => '2026-05-08',
                'nama_proyek' => 'Java Water Pool',
                'shift' => 'Pagi',
                'status' => 'Submitted',
                'project_progress' => 62,
                'payload' => [
                    'tanggal' => '2026-05-08',
                    'namaProyek' => 'Java Water Pool',
                    'progress' => 62,
                    'shift' => 'Pagi',
                    'jumlahTukangHariIni' => '10',
                    'namaTukangIzinPagi' => ['Rian', 'Bagus', ''],
                    'teleponKepalaTukangPagi' => 'YA',
                    'catatanKepalaTukangPagi' => 'Pembersihan area mesin selesai, fokus lanjut pemasangan jalur pipa return.',
                    'prakiraanCuaca' => 'Cerah berawan',
                    'pekerjaanUtamaHariIni' => 'Pemasangan pipa return kolam utama',
                    'rencanaPekerjaanHariIni' => [
                        ['itemPekerjaan' => 'Pasang pipa return sisi timur', 'volume' => '24 meter', 'jumlahPekerja' => '4'],
                        ['itemPekerjaan' => 'Rapikan area balancing tank', 'volume' => '1 area', 'jumlahPekerja' => '2'],
                        ['itemPekerjaan' => 'Cek pressure test jalur inlet', 'volume' => '1 jalur', 'jumlahPekerja' => '2'],
                    ],
                    'rencanaMaterialHariIni' => 'Pipa PVC 3 inch, lem pipa, fitting elbow.',
                    'materialDatangHariIni' => [
                        ['material' => 'Pipa PVC 3 inch', 'jumlah' => '30', 'satuan' => 'batang', 'eta' => '09:15'],
                        ['material' => 'Fitting elbow 3 inch', 'jumlah' => '20', 'satuan' => 'pcs', 'eta' => '10:00'],
                    ],
                    'cctvJam8' => 'daily-reports/cctv/jwp-0800.jpg',
                ],
            ],
            [
                'report_id' => 'LHR-260508-A2S1',
                'tanggal' => '2026-05-08',
                'nama_proyek' => 'Aqua Bliss Pool',
                'shift' => 'Siang',
                'status' => 'Revision',
                'project_progress' => 71,
                'payload' => [
                    'tanggal' => '2026-05-08',
                    'namaProyek' => 'Aqua Bliss Pool',
                    'progress' => 71,
                    'shift' => 'Siang',
                    'tukangSakitSetengahHari' => '1',
                    'namaTukangIzinSiang' => ['Yoga', '', ''],
                    'teleponKepalaTukangSiang' => 'YA',
                    'catatanKepalaTukangSiang' => 'Pemasangan mosaik berjalan, tetapi nat keramik belum datang sampai jam makan siang.',
                    'statusPekerjaanSiang' => [
                        ['itemPekerjaan' => 'Pasang mosaik dinding overflow', 'status' => 'Di bawah Target (< 50%)', 'penyebab' => 'Nat keramik terlambat dikirim supplier.'],
                        ['itemPekerjaan' => 'Pembersihan ruang pompa', 'status' => 'Mencapai 50% (On-Track)', 'penyebab' => ''],
                    ],
                    'statusMaterialDatangSiang' => [
                        ['material' => 'Nat keramik biru', 'status' => 'Belum Datang', 'suratJalan' => ''],
                        ['material' => 'Sikat kolam', 'status' => 'Sesuai ETA & Sudah Bongkar Muat', 'suratJalan' => 'daily-reports/surat-jalan/abp-1.jpg'],
                    ],
                    'teleponMaterialLusa' => 'YA',
                    'kebutuhanMaterialLusa' => [
                        ['material' => 'Nat keramik biru', 'jumlah' => '25', 'satuan' => 'sak'],
                        ['material' => 'Pipa vacuum fleksibel', 'jumlah' => '2', 'satuan' => 'roll'],
                    ],
                    'cctvJam10' => 'daily-reports/cctv/abp-1000.jpg',
                    'cctvJam12' => 'daily-reports/cctv/abp-1200.jpg',
                ],
            ],
            [
                'report_id' => 'LHR-260508-A3R1',
                'tanggal' => '2026-05-08',
                'nama_proyek' => 'Tirta Prima Pool Care',
                'shift' => 'Sore',
                'status' => 'Approved',
                'project_progress' => 84,
                'payload' => [
                    'tanggal' => '2026-05-08',
                    'namaProyek' => 'Tirta Prima Pool Care',
                    'progress' => 84,
                    'shift' => 'Sore',
                    'teleponKepalaTukangSore' => 'YA',
                    'catatanKepalaTukangSore' => 'Servis panel dan kalibrasi dosing pump selesai sesuai target.',
                    'statusPekerjaanSore' => 'Mencapai 100% (On-Track)',
                    'uploadFotoHasil' => 'daily-reports/hasil/tppc-1.jpg',
                    'penyebabPekerjaanSore' => '',
                    'orderMaterialSiang' => 'YA',
                    'materialHarga' => [
                        ['namaBahan' => 'Chemical chlorine', 'jumlah' => '8', 'hargaSatuan' => '185000', 'hargaJumlah' => '1480000'],
                        ['namaBahan' => 'PH minus', 'jumlah' => '4', 'hargaSatuan' => '120000', 'hargaJumlah' => '480000'],
                    ],
                    'fotoNota' => 'daily-reports/nota/tppc-1.jpg',
                    'kendalaKerjaHariIni' => 'Tidak ada kendala signifikan.',
                    'targetUtamaBesok' => 'Monitoring hasil balancing air dan uji coba dosing otomatis.',
                    'statusMaterialBesok' => 'Aman 100% (On-Track)',
                    'cctvJam14' => 'daily-reports/cctv/tppc-1400.jpg',
                    'cctvJam16' => 'daily-reports/cctv/tppc-1600.jpg',
                    'rincianPengeluaranKas' => [
                        ['namaBahan' => 'Solar genset', 'jumlah' => '15', 'hargaSatuan' => '13000', 'hargaJumlah' => '195000'],
                        ['namaBahan' => 'Konsumsi tim', 'jumlah' => '10', 'hargaSatuan' => '25000', 'hargaJumlah' => '250000'],
                    ],
                    'financeFotoNota' => 'daily-reports/nota-finance/tppc-1.jpg',
                    'kasbonTukang' => [
                        ['namaTukang' => 'Wawan', 'jumlahKasbon' => '200000'],
                        ['namaTukang' => 'Rama', 'jumlahKasbon' => '150000'],
                    ],
                ],
            ],
            [
                'report_id' => 'LHR-260507-B1P1',
                'tanggal' => '2026-05-07',
                'nama_proyek' => 'Blue Wave Pool Solutions',
                'shift' => 'Pagi',
                'status' => 'Draft',
                'project_progress' => 47,
                'payload' => [
                    'tanggal' => '2026-05-07',
                    'namaProyek' => 'Blue Wave Pool Solutions',
                    'progress' => 47,
                    'shift' => 'Pagi',
                    'jumlahTukangHariIni' => '7',
                    'namaTukangIzinPagi' => ['Tono', '', ''],
                    'teleponKepalaTukangPagi' => 'BELUM',
                    'catatanKepalaTukangPagi' => 'Supervisor lapangan belum tersambung pagi hari karena kunjungan supplier.',
                    'prakiraanCuaca' => 'Cerah',
                    'pekerjaanUtamaHariIni' => 'Pembersihan jalur sirkulasi kolam anak',
                    'rencanaPekerjaanHariIni' => [
                        ['itemPekerjaan' => 'Kurasi pipa bekas', 'volume' => '12 meter', 'jumlahPekerja' => '3'],
                        ['itemPekerjaan' => 'Pembersihan nozzle', 'volume' => '18 titik', 'jumlahPekerja' => '2'],
                    ],
                    'rencanaMaterialHariIni' => 'Nozzle baru, pipa 1.5 inch, clamp.',
                    'materialDatangHariIni' => [
                        ['material' => 'Nozzle inlet', 'jumlah' => '18', 'satuan' => 'pcs', 'eta' => '11:30'],
                    ],
                    'cctvJam8' => 'daily-reports/cctv/bwps-0800.jpg',
                ],
            ],
            [
                'report_id' => 'LHR-260507-B2S1',
                'tanggal' => '2026-05-07',
                'nama_proyek' => 'Java Water Pool',
                'shift' => 'Siang',
                'status' => 'Submitted',
                'project_progress' => 59,
                'payload' => [
                    'tanggal' => '2026-05-07',
                    'namaProyek' => 'Java Water Pool',
                    'progress' => 59,
                    'shift' => 'Siang',
                    'tukangSakitSetengahHari' => 'Nihil',
                    'namaTukangIzinSiang' => ['', '', ''],
                    'teleponKepalaTukangSiang' => 'YA',
                    'catatanKepalaTukangSiang' => 'Pressure test lulus, tinggal merapikan sambungan di area pompa.',
                    'statusPekerjaanSiang' => [
                        ['itemPekerjaan' => 'Pressure test jalur return', 'status' => 'Selesai Lebih Cepat (100%)', 'penyebab' => ''],
                        ['itemPekerjaan' => 'Rapi sambungan pompa', 'status' => 'Mencapai 50% (On-Track)', 'penyebab' => ''],
                    ],
                    'statusMaterialDatangSiang' => [
                        ['material' => 'Lem pipa heavy duty', 'status' => 'Sesuai ETA & Sudah Bongkar Muat', 'suratJalan' => 'daily-reports/surat-jalan/jwp-1.jpg'],
                    ],
                    'teleponMaterialLusa' => 'YA',
                    'kebutuhanMaterialLusa' => [
                        ['material' => 'Valve 3 inch', 'jumlah' => '4', 'satuan' => 'pcs'],
                    ],
                    'cctvJam10' => 'daily-reports/cctv/jwp-1000.jpg',
                    'cctvJam12' => 'daily-reports/cctv/jwp-1200.jpg',
                ],
            ],
            [
                'report_id' => 'LHR-260507-B3R1',
                'tanggal' => '2026-05-07',
                'nama_proyek' => 'Aqua Bliss Pool',
                'shift' => 'Sore',
                'status' => 'Approved',
                'project_progress' => 68,
                'payload' => [
                    'tanggal' => '2026-05-07',
                    'namaProyek' => 'Aqua Bliss Pool',
                    'progress' => 68,
                    'shift' => 'Sore',
                    'teleponKepalaTukangSore' => 'YA',
                    'catatanKepalaTukangSore' => 'Area overflow selesai dicoating, area mosaik tinggal nat final.',
                    'statusPekerjaanSore' => 'Mangkrak/Berhenti/Belum selesai',
                    'uploadFotoHasil' => 'daily-reports/hasil/abp-1.jpg',
                    'penyebabPekerjaanSore' => 'Material nat final belum lengkap di sore hari.',
                    'orderMaterialSiang' => 'YA',
                    'materialHarga' => [
                        ['namaBahan' => 'Nat keramik biru', 'jumlah' => '20', 'hargaSatuan' => '98000', 'hargaJumlah' => '1960000'],
                    ],
                    'fotoNota' => 'daily-reports/nota/abp-1.jpg',
                    'kendalaKerjaHariIni' => 'Koordinasi pengiriman supplier terlambat 2 jam.',
                    'targetUtamaBesok' => 'Selesaikan nat mosaik dan pembersihan area overflow.',
                    'statusMaterialBesok' => 'Kurang/Belum datang',
                    'cctvJam14' => 'daily-reports/cctv/abp-1400.jpg',
                    'cctvJam16' => 'daily-reports/cctv/abp-1600.jpg',
                    'rincianPengeluaranKas' => [
                        ['namaBahan' => 'Bensin operasional', 'jumlah' => '10', 'hargaSatuan' => '14000', 'hargaJumlah' => '140000'],
                    ],
                    'financeFotoNota' => 'daily-reports/nota-finance/abp-1.jpg',
                    'kasbonTukang' => [
                        ['namaTukang' => 'Joko', 'jumlahKasbon' => '250000'],
                    ],
                ],
            ],
        ];

        foreach ($reports as $report) {
            DailyReportSubmission::query()->updateOrCreate(
                ['report_id' => $report['report_id']],
                [
                    'submitted_by' => $productManager->id,
                    'tanggal' => $report['tanggal'],
                    'nama_proyek' => $report['nama_proyek'],
                    'shift' => $report['shift'],
                    'status' => $report['status'],
                    'payload' => $report['payload'],
                ],
            );

            Project::query()
                ->where('nama_proyek', $report['nama_proyek'])
                ->update([
                    'product_manager' => $productManager->name,
                    'progress' => $report['project_progress'],
                ]);
        }
    }
}
