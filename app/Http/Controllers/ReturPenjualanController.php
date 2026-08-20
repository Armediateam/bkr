<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturPenjualanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('retur-penjualan', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Retur Penjualan', 'href' => '/dashboard/retur-penjualan'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'produkList' => [
                ['id' => 1, 'kode' => 'PRD-001', 'nama' => 'Pompa Kolam Renang', 'hargaJual' => 3500000, 'hpp' => 2600000],
                ['id' => 2, 'kode' => 'PRD-002', 'nama' => 'Filter Kolam Renang', 'hargaJual' => 2800000, 'hpp' => 2100000],
                ['id' => 3, 'kode' => 'PRD-003', 'nama' => 'Chemical Treatment', 'hargaJual' => 750000, 'hpp' => 420000],
            ],
            'customerList' => ['Walk-in Customer', 'Villa Samudra Management', 'Blue Lagoon Hospitality', 'Tirta Kencana Club'],
            'piutangAktif' => [
                ['id' => 1, 'pelanggan' => 'Villa Samudra Management', 'keterangan' => 'Invoice INV-001', 'sisa' => 4500000],
                ['id' => 2, 'pelanggan' => 'Blue Lagoon Hospitality', 'keterangan' => 'Invoice INV-002', 'sisa' => 2800000],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form retur penjualan sudah diterima. Penyimpanan jurnal, kas/piutang, stok, dan pembalikan HPP akan aktif setelah backend finansial dipindahkan.');
    }
}
