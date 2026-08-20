<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DatabaseContactController extends Controller
{
    public function customer(): Response
    {
        return Inertia::render('database-customer', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Customer', 'href' => '/dashboard/database/customer'],
            ],
            'customers' => [
                [
                    'id' => 1,
                    'nama' => 'PT Tirta Jernih Abadi',
                    'kontak' => '0812-4455-7788 / Ibu Rani',
                    'alamat' => 'Jl. Boulevard Gading Serpong No. 12',
                    'catatan' => 'Langganan maintenance kolam bulanan.',
                    'totalOmzet' => 87500000,
                    'keuntungan' => 26300000,
                    'piutang' => 12500000,
                    'jatuhTempo' => 4500000,
                    'status' => 'Pelanggan Setia',
                    'terakhirBeli' => now()->subDays(3)->toDateString(),
                    'transaksi' => 18,
                ],
                [
                    'id' => 2,
                    'nama' => 'Villa Cemara Indah',
                    'kontak' => '0857-9988-2211 / Pak Dimas',
                    'alamat' => 'Sentul City Cluster Cemara B-21',
                    'catatan' => 'Sering pesan chemical dan sparepart pompa.',
                    'totalOmzet' => 42600000,
                    'keuntungan' => 11450000,
                    'piutang' => 7200000,
                    'jatuhTempo' => 0,
                    'status' => 'Pelanggan Reguler',
                    'terakhirBeli' => now()->subDays(9)->toDateString(),
                    'transaksi' => 11,
                ],
                [
                    'id' => 3,
                    'nama' => 'Hotel Samudra Biru',
                    'kontak' => 'finance@samudrabiru.test',
                    'alamat' => 'Jl. Pantai Utara KM 7',
                    'catatan' => 'Butuh PO dan invoice sebelum pembayaran.',
                    'totalOmzet' => 116800000,
                    'keuntungan' => 31800000,
                    'piutang' => 24800000,
                    'jatuhTempo' => 9800000,
                    'status' => 'Pelanggan Setia',
                    'terakhirBeli' => now()->subDays(14)->toDateString(),
                    'transaksi' => 23,
                ],
            ],
            'activities' => [
                ['tanggal' => now()->subDays(2)->toDateString(), 'customer' => 'PT Tirta Jernih Abadi', 'keterangan' => 'Penjualan chemical dan jasa vacuum', 'nilai' => 6800000, 'status' => 'Lunas'],
                ['tanggal' => now()->subDays(7)->toDateString(), 'customer' => 'Villa Cemara Indah', 'keterangan' => 'Penggantian filter cartridge', 'nilai' => 7200000, 'status' => 'Belum Lunas'],
                ['tanggal' => now()->subDays(12)->toDateString(), 'customer' => 'Hotel Samudra Biru', 'keterangan' => 'Paket maintenance bulanan', 'nilai' => 14800000, 'status' => 'Belum Lunas'],
            ],
        ]);
    }

    public function vendor(): Response
    {
        return Inertia::render('database-vendor', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Vendor', 'href' => '/dashboard/database/vendor'],
            ],
            'vendors' => [
                [
                    'id' => 1,
                    'nama' => 'CV Aqua Prima Supply',
                    'kontak' => '0813-6677-9900 / Pak Arif',
                    'alamat' => 'Pergudangan Taman Tekno Blok E3',
                    'catatan' => 'Supplier chemical utama.',
                    'totalBelanja' => 63500000,
                    'hutang' => 11500000,
                    'jatuhTempo' => 3000000,
                    'terakhirBeli' => now()->subDays(5)->toDateString(),
                    'transaksi' => 14,
                ],
                [
                    'id' => 2,
                    'nama' => 'PT Pompa Nusantara',
                    'kontak' => 'sales@pompanusantara.test',
                    'alamat' => 'Jl. Industri Raya No. 41',
                    'catatan' => 'Pompa, filter, valve, dan aksesoris instalasi.',
                    'totalBelanja' => 128900000,
                    'hutang' => 36800000,
                    'jatuhTempo' => 16800000,
                    'terakhirBeli' => now()->subDays(11)->toDateString(),
                    'transaksi' => 9,
                ],
                [
                    'id' => 3,
                    'nama' => 'UD Mandiri Teknik',
                    'kontak' => '0856-2211-7700 / Bu Sinta',
                    'alamat' => 'Pasar Teknik Glodok Lantai 2',
                    'catatan' => 'Cadangan sparepart urgent.',
                    'totalBelanja' => 21400000,
                    'hutang' => 0,
                    'jatuhTempo' => 0,
                    'terakhirBeli' => now()->subDays(20)->toDateString(),
                    'transaksi' => 6,
                ],
            ],
            'activities' => [
                ['tanggal' => now()->subDays(4)->toDateString(), 'vendor' => 'CV Aqua Prima Supply', 'keterangan' => 'Pembelian kaporit dan soda ash', 'nilai' => 11500000, 'status' => 'Belum Lunas'],
                ['tanggal' => now()->subDays(10)->toDateString(), 'vendor' => 'PT Pompa Nusantara', 'keterangan' => 'Pompa Hayward 1.5 HP dan valve', 'nilai' => 36800000, 'status' => 'Belum Lunas'],
                ['tanggal' => now()->subDays(17)->toDateString(), 'vendor' => 'UD Mandiri Teknik', 'keterangan' => 'Seal, fitting, dan clamp', 'nilai' => 4200000, 'status' => 'Lunas'],
            ],
        ]);
    }

    public function storeCustomer(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form tambah customer sudah diterima. Penyimpanan database customer akan aktif setelah backend finansial dipindahkan.');
    }

    public function storeVendor(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form tambah vendor sudah diterima. Penyimpanan database vendor akan aktif setelah backend finansial dipindahkan.');
    }
}
