<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembelianController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pembelian', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pembelian', 'href' => '/dashboard/pembelian'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunPersediaan' => [
                ['kode' => '1130', 'nama' => 'Persediaan Barang'],
                ['kode' => '1131', 'nama' => 'Bahan Mentah'],
                ['kode' => '1132', 'nama' => 'Bahan Olahan'],
            ],
            'akunAset' => [
                ['kode' => '1200', 'nama' => 'Peralatan'],
                ['kode' => '1210', 'nama' => 'Kendaraan'],
                ['kode' => '1220', 'nama' => 'Gedung & Bangunan'],
            ],
            'proyekAktif' => Project::query()
                ->select(['id', 'project_id', 'nama_proyek'])
                ->orderBy('nama_proyek')
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'kode' => $project->project_id,
                    'nama' => $project->nama_proyek,
                ]),
            'produkList' => [
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2600000, 'stok' => 5],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2100000, 'stok' => 7],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'hargaBeli' => 420000, 'stok' => 20],
            ],
            'vendorList' => ['CV Tirta Pool Supply', 'PT Aqua Teknik', 'Supplier Umum', 'Bengkel Peralatan Kolam'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pembelian sudah diterima. Penyimpanan jurnal, stok, hutang, dan aset akan aktif setelah backend finansial dipindahkan.');
    }
}
