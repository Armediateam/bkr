<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function stock(): Response
    {
        return Inertia::render('inventory-stock', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Inventory', 'href' => '/dashboard/stok'],
            ],
            'products' => [
                ['id' => 1, 'kode' => 'CHEM-CL90', 'nama' => 'Kaporit Granular 90%', 'kategori' => 'Chemical', 'satuan' => 'kg', 'stok' => 42, 'minStok' => 15, 'hargaBeli' => 36000, 'hargaJual' => 52000, 'terakhirBeli' => now()->subDays(5)->toDateString()],
                ['id' => 2, 'kode' => 'CHEM-SODA', 'nama' => 'Soda Ash', 'kategori' => 'Chemical', 'satuan' => 'kg', 'stok' => 8, 'minStok' => 10, 'hargaBeli' => 18000, 'hargaJual' => 28500, 'terakhirBeli' => now()->subDays(9)->toDateString()],
                ['id' => 3, 'kode' => 'PUMP-15HP', 'nama' => 'Pompa Kolam 1.5 HP', 'kategori' => 'Pompa', 'satuan' => 'unit', 'stok' => 3, 'minStok' => 2, 'hargaBeli' => 2850000, 'hargaJual' => 3750000, 'terakhirBeli' => now()->subDays(18)->toDateString()],
                ['id' => 4, 'kode' => 'FILTER-CART', 'nama' => 'Filter Cartridge C-7468', 'kategori' => 'Filter', 'satuan' => 'pcs', 'stok' => -1, 'minStok' => 4, 'hargaBeli' => 235000, 'hargaJual' => 345000, 'terakhirBeli' => now()->subDays(24)->toDateString()],
            ],
            'nonSku' => [
                'saldo' => 7350000,
                'rows' => [
                    ['tanggal' => now()->subDays(3)->toDateString(), 'deskripsi' => 'Bahan umum maintenance', 'transaksi' => 'Beli Non-SKU', 'perubahan' => 1800000],
                    ['tanggal' => now()->subDays(8)->toDateString(), 'deskripsi' => 'Bahan rusak/kadaluarsa', 'transaksi' => 'Koreksi Berkurang', 'perubahan' => -450000],
                    ['tanggal' => now()->subDays(15)->toDateString(), 'deskripsi' => 'Saldo awal bahan cair', 'transaksi' => 'Saldo Awal', 'perubahan' => 6000000],
                ],
            ],
        ]);
    }

    public function production(): Response
    {
        return Inertia::render('inventory-production', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Produksi', 'href' => '/dashboard/produksi'],
            ],
            'today' => now()->toDateString(),
            'products' => [
                ['id' => 1, 'nama' => 'Paket Chemical Weekly', 'satuan' => 'paket', 'hpp' => 178000, 'stok' => 12],
                ['id' => 2, 'nama' => 'Kaporit Granular 90%', 'satuan' => 'kg', 'hpp' => 36000, 'stok' => 42],
                ['id' => 3, 'nama' => 'Soda Ash', 'satuan' => 'kg', 'hpp' => 18000, 'stok' => 8],
            ],
            'cashAccounts' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
            ],
            'history' => [
                ['id' => 1, 'tanggal' => now()->subDays(2)->toDateString(), 'produk' => 'Paket Chemical Weekly', 'qty' => 10, 'satuan' => 'paket', 'bahan' => 'Kaporit, Soda Ash, bahan umum', 'totalHpp' => 1780000, 'hppUnit' => 178000],
                ['id' => 2, 'tanggal' => now()->subDays(11)->toDateString(), 'produk' => 'Paket Cleaning Kit', 'qty' => 6, 'satuan' => 'paket', 'bahan' => 'Brush, net, chemical starter', 'totalHpp' => 2550000, 'hppUnit' => 425000],
            ],
        ]);
    }

    public function hppCalculator(): Response
    {
        return Inertia::render('inventory-hpp-calculator', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Master HPP', 'href' => '/dashboard/kalkulator-hpp'],
            ],
            'savedProducts' => [
                ['id' => 1, 'nama' => 'Paket Chemical Weekly', 'jenis' => 'PAKET', 'satuan' => 'paket', 'hargaJual' => 325000, 'totalHpp' => 178000],
                ['id' => 2, 'nama' => 'Jasa Vacuum + Chemical', 'jenis' => 'JASA', 'satuan' => 'kunjungan', 'hargaJual' => 450000, 'totalHpp' => 185000],
                ['id' => 3, 'nama' => 'Paket Starter Kolam Baru', 'jenis' => 'PAKET', 'satuan' => 'paket', 'hargaJual' => 1250000, 'totalHpp' => 760000],
            ],
        ]);
    }

    public function storeStock(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form inventory sudah diterima. Penyimpanan stok akan aktif setelah backend finansial dipindahkan.');
    }

    public function storeProduction(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form produksi sudah diterima. Penyimpanan produksi akan aktif setelah backend finansial dipindahkan.');
    }

    public function storeHpp(Request $request): RedirectResponse
    {
        return back()->with('success', 'Kalkulator HPP sudah diterima. Penyimpanan master HPP akan aktif setelah backend finansial dipindahkan.');
    }
}
