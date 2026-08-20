<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function transactions(): Response
    {
        return Inertia::render('journal-transactions', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Jurnal', 'href' => '/dashboard/transaksi'],
            ],
            'today' => now()->toDateString(),
            'accounts' => [
                ['id' => 1, 'kode' => '1101', 'nama' => 'Kas Utama', 'tipe' => 'Aset'],
                ['id' => 2, 'kode' => '1102', 'nama' => 'Bank BCA', 'tipe' => 'Aset'],
                ['id' => 3, 'kode' => '1120', 'nama' => 'Piutang Usaha', 'tipe' => 'Aset'],
                ['id' => 4, 'kode' => '1130', 'nama' => 'Persediaan Barang', 'tipe' => 'Aset'],
                ['id' => 5, 'kode' => '2100', 'nama' => 'Hutang Usaha', 'tipe' => 'Liabilitas'],
                ['id' => 6, 'kode' => '3100', 'nama' => 'Modal Pemilik', 'tipe' => 'Ekuitas'],
                ['id' => 7, 'kode' => '4100', 'nama' => 'Pendapatan Penjualan', 'tipe' => 'Pendapatan'],
                ['id' => 8, 'kode' => '5100', 'nama' => 'Harga Pokok Penjualan', 'tipe' => 'Beban'],
                ['id' => 9, 'kode' => '6100', 'nama' => 'Beban Operasional', 'tipe' => 'Beban'],
            ],
            'journals' => [
                ['id' => 1, 'nomor' => 'JR-2026-0818-001', 'tanggal' => now()->subDays(2)->toDateString(), 'keterangan' => 'Penjualan chemical dan jasa vacuum', 'referensi' => 'INV-2026-0818-001', 'kategori' => 'OPERASIONAL', 'jumlah' => 6800000, 'source' => 'Invoice', 'cashier' => null],
                ['id' => 2, 'nomor' => 'JR-2026-0816-004', 'tanggal' => now()->subDays(4)->toDateString(), 'keterangan' => 'Pembelian kaporit dan soda ash', 'referensi' => 'PO-2026-0816-002', 'kategori' => 'OPERASIONAL', 'jumlah' => 11500000, 'source' => 'Purchase Order', 'cashier' => null],
                ['id' => 3, 'nomor' => 'JR-2026-0815-002', 'tanggal' => now()->subDays(5)->toDateString(), 'keterangan' => 'Transfer kas utama ke Bank BCA', 'referensi' => 'TRF-0815', 'kategori' => 'OPERASIONAL', 'jumlah' => 15000000, 'source' => 'Manual', 'cashier' => null],
                ['id' => 4, 'nomor' => 'POS-2026-0812-009', 'tanggal' => now()->subDays(8)->toDateString(), 'keterangan' => 'Penjualan POS kasir', 'referensi' => 'POS-KSR-009', 'kategori' => 'OPERASIONAL', 'jumlah' => 1250000, 'source' => 'POS', 'cashier' => 'Kasir 1'],
            ],
        ]);
    }

    public function activityLog(): Response
    {
        return Inertia::render('activity-log', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Log Aktivitas', 'href' => '/dashboard/log'],
            ],
            'summary' => [
                ['kategori' => 'Transaksi', 'jumlah' => 18],
                ['kategori' => 'Inventory', 'jumlah' => 9],
                ['kategori' => 'Master Data', 'jumlah' => 7],
                ['kategori' => 'Sistem', 'jumlah' => 4],
            ],
            'logs' => [
                ['id' => 1, 'waktu' => now()->subMinutes(18)->toDateTimeString(), 'kategori' => 'Transaksi', 'aksi' => 'Membuat invoice INV-2026-0818-001', 'user' => 'Owner', 'role' => 'ADMIN', 'detail' => 'Penjualan chemical dan jasa vacuum untuk PT Tirta Jernih Abadi'],
                ['id' => 2, 'waktu' => now()->subHours(2)->toDateTimeString(), 'kategori' => 'Inventory', 'aksi' => 'Koreksi stok opname', 'user' => 'Owner', 'role' => 'ADMIN', 'detail' => 'Filter Cartridge C-7468 disesuaikan menjadi -1 pcs'],
                ['id' => 3, 'waktu' => now()->subHours(6)->toDateTimeString(), 'kategori' => 'Master Data', 'aksi' => 'Menambah vendor', 'user' => 'Finance', 'role' => 'FINANCE', 'detail' => 'PT Pompa Nusantara masuk database vendor'],
                ['id' => 4, 'waktu' => now()->subDay()->toDateTimeString(), 'kategori' => 'Sistem', 'aksi' => 'Login berhasil', 'user' => 'Owner', 'role' => 'ADMIN', 'detail' => 'Masuk dari dashboard owner'],
            ],
        ]);
    }

    public function storeTransaction(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form jurnal transaksi sudah diterima. Penyimpanan jurnal double-entry akan aktif setelah backend finansial dipindahkan.');
    }
}
