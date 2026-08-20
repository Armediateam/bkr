<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function kasir(): Response
    {
        return Inertia::render('pos-kasir', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'POS Kasir', 'href' => '/dashboard/pos'],
            ],
            'shiftOpen' => true,
            'cashier' => auth()->user()?->name ?? 'Kasir',
            'categories' => ['Semua', 'Peralatan', 'Chemical', 'Jasa'],
            'products' => [
                ['id' => 1, 'kode' => 'PRD-001', 'nama' => 'Pompa Kolam Renang', 'kategori' => 'Peralatan', 'satuan' => 'unit', 'harga' => 3500000, 'stok' => 5, 'favorit' => true],
                ['id' => 2, 'kode' => 'PRD-002', 'nama' => 'Filter Kolam Renang', 'kategori' => 'Peralatan', 'satuan' => 'unit', 'harga' => 2800000, 'stok' => 7, 'favorit' => false],
                ['id' => 3, 'kode' => 'PRD-003', 'nama' => 'Chemical Treatment', 'kategori' => 'Chemical', 'satuan' => 'paket', 'harga' => 750000, 'stok' => 20, 'favorit' => true],
                ['id' => 4, 'kode' => 'SRV-001', 'nama' => 'Jasa Maintenance Kolam', 'kategori' => 'Jasa', 'satuan' => 'visit', 'harga' => 450000, 'stok' => 999, 'favorit' => false],
            ],
            'vouchers' => [
                ['kode' => 'WELCOME50', 'nama' => 'Diskon Member', 'nominal' => 50000],
                ['kode' => 'SERVICE10', 'nama' => 'Diskon Jasa', 'nominal' => 100000],
            ],
        ]);
    }

    public function master(): Response
    {
        return Inertia::render('pos-master', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Master POS', 'href' => '/dashboard/pos/master'],
            ],
            'kpis' => [
                'omzetPeriode' => 18500000,
                'transaksiPeriode' => 32,
                'omzetHariIni' => 2750000,
                'transaksiHariIni' => 6,
                'avgTrx' => 578125,
                'shiftAktif' => 1,
            ],
            'paymentSplit' => [
                ['metode' => 'Tunai', 'nominal' => 7250000, 'transaksi' => 12],
                ['metode' => 'Transfer', 'nominal' => 8900000, 'transaksi' => 14],
                ['metode' => 'QRIS', 'nominal' => 2350000, 'transaksi' => 6],
            ],
            'hourlyOrders' => [
                ['jam' => '09:00', 'trx' => 2, 'omzet' => 850000],
                ['jam' => '11:00', 'trx' => 4, 'omzet' => 1900000],
                ['jam' => '14:00', 'trx' => 3, 'omzet' => 1450000],
                ['jam' => '16:00', 'trx' => 5, 'omzet' => 2600000],
            ],
            'recentTransactions' => [
                ['nomor' => 'POS-001', 'tanggal' => now()->toDateString(), 'kasir' => 'Kasir', 'metode' => 'Tunai', 'total' => 750000],
                ['nomor' => 'POS-002', 'tanggal' => now()->toDateString(), 'kasir' => 'Kasir', 'metode' => 'QRIS', 'total' => 450000],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Transaksi POS sudah diterima. Penyimpanan struk, shift, pembayaran, dan stok akan aktif setelah backend finansial dipindahkan.');
    }
}
