<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengeluaranController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pengeluaran', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pengeluaran', 'href' => '/dashboard/pengeluaran'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunBeban' => [
                ['kode' => '6100', 'nama' => 'Beban Gaji'],
                ['kode' => '6110', 'nama' => 'Beban Sewa'],
                ['kode' => '6120', 'nama' => 'Beban Listrik & Air'],
                ['kode' => '6140', 'nama' => 'Beban Pemasaran'],
                ['kode' => '6150', 'nama' => 'Beban Administrasi'],
                ['kode' => '6160', 'nama' => 'Beban Bunga'],
                ['kode' => '6180', 'nama' => 'Beban Lainnya'],
            ],
            'akunPajak' => [
                ['kode' => '6170', 'nama' => 'Beban Pajak'],
                ['kode' => '6171', 'nama' => 'PPh Final'],
                ['kode' => '6172', 'nama' => 'PBB'],
            ],
            'akunPrive' => [
                ['kode' => '3300', 'nama' => 'Prive / Penarikan Owner'],
                ['kode' => '3310', 'nama' => 'Penarikan Owner 1'],
                ['kode' => '3320', 'nama' => 'Penarikan Owner 2'],
            ],
            'subkategoriList' => ['Gaji', 'Sewa', 'Utilitas', 'Pemasaran', 'Administrasi', 'Bunga', 'Lainnya'],
            'proyekAktif' => Project::query()
                ->select(['id', 'project_id', 'nama_proyek'])
                ->orderBy('nama_proyek')
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'kode' => $project->project_id,
                    'nama' => $project->nama_proyek,
                ]),
            'vendorList' => ['CV Tirta Pool Supply', 'PT Aqua Teknik', 'Supplier Umum', 'Bengkel Peralatan Kolam'],
            'karyawanList' => ['Ahmad Fauzi', 'Budi Santoso', 'Siti Aminah', 'Rina Marlina'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pengeluaran sudah diterima. Penyimpanan jurnal, kas, hutang, pajak, dan pinjaman karyawan akan aktif setelah backend finansial dipindahkan.');
    }
}
