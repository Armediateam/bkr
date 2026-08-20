<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportMarketplaceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('import-marketplace', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Import Marketplace', 'href' => '/dashboard/import-marketplace'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'produkList' => [
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'stok' => 5, 'hargaBeli' => 2600000],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'stok' => 7, 'hargaBeli' => 2100000],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'stok' => 20, 'hargaBeli' => 420000],
            ],
            'previewDays' => [
                ['tanggal' => now()->subDays(3)->toDateString(), 'keterangan' => 'Import Shopee - Omzet Harian', 'omzet' => 1850000, 'duplicate' => false],
                ['tanggal' => now()->subDays(2)->toDateString(), 'keterangan' => 'Import Shopee - Omzet Harian', 'omzet' => 2400000, 'duplicate' => true],
                ['tanggal' => now()->subDay()->toDateString(), 'keterangan' => 'Import Shopee - Omzet Harian', 'omzet' => 1675000, 'duplicate' => false],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Import marketplace sudah diterima. Parser Excel dan posting jurnal harian akan aktif setelah backend finansial dipindahkan.');
    }
}
