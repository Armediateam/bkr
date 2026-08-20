<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PemasukanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pemasukan', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Penjualan', 'href' => '/dashboard/pemasukan'],
            ],
            'today' => now()->toDateString(),
            'saldoPersediaan' => 0,
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunPendapatan' => [
                ['kode' => '4100', 'nama' => 'Pendapatan Penjualan'],
                ['kode' => '4200', 'nama' => 'Pendapatan Jasa'],
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
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'harga' => 3500000, 'hpp' => 2600000, 'stok' => 5],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'harga' => 2800000, 'hpp' => 2100000, 'stok' => 7],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'harga' => 750000, 'hpp' => 420000, 'stok' => 20],
            ],
            'customerList' => ['Walk-in Customer', 'Villa Samudra Management', 'Blue Lagoon Hospitality', 'Tirta Kencana Club'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form penjualan sudah diterima. Penyimpanan jurnal akan aktif setelah backend finansial dipindahkan.');
    }
}
