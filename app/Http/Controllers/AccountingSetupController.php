<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingSetupController extends Controller
{
    public function chartOfAccounts(): Response
    {
        return Inertia::render('chart-of-accounts', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Bagan Akun', 'href' => '/dashboard/bagan-akun'],
            ],
            'accounts' => [
                ['id' => 1, 'kode' => '1101', 'nama' => 'Kas Utama', 'tipe' => 'Aset', 'subtipe' => 'Kas & Bank', 'saldoNormal' => 'Debit', 'pakai' => 12],
                ['id' => 2, 'kode' => '1102', 'nama' => 'Bank BCA', 'tipe' => 'Aset', 'subtipe' => 'Kas & Bank', 'saldoNormal' => 'Debit', 'pakai' => 8],
                ['id' => 3, 'kode' => '1120', 'nama' => 'Piutang Usaha', 'tipe' => 'Aset', 'subtipe' => 'Aset Lancar', 'saldoNormal' => 'Debit', 'pakai' => 6],
                ['id' => 4, 'kode' => '1130', 'nama' => 'Persediaan Barang', 'tipe' => 'Aset', 'subtipe' => 'Inventory', 'saldoNormal' => 'Debit', 'pakai' => 14],
                ['id' => 5, 'kode' => '2100', 'nama' => 'Hutang Usaha', 'tipe' => 'Liabilitas', 'subtipe' => 'Liabilitas Lancar', 'saldoNormal' => 'Kredit', 'pakai' => 7],
                ['id' => 6, 'kode' => '3100', 'nama' => 'Modal Pemilik', 'tipe' => 'Ekuitas', 'subtipe' => 'Modal', 'saldoNormal' => 'Kredit', 'pakai' => 4],
                ['id' => 7, 'kode' => '4100', 'nama' => 'Pendapatan Penjualan', 'tipe' => 'Pendapatan', 'subtipe' => 'Pendapatan Utama', 'saldoNormal' => 'Kredit', 'pakai' => 18],
                ['id' => 8, 'kode' => '5100', 'nama' => 'Harga Pokok Penjualan', 'tipe' => 'Beban', 'subtipe' => 'HPP', 'saldoNormal' => 'Debit', 'pakai' => 10],
                ['id' => 9, 'kode' => '6100', 'nama' => 'Beban Operasional', 'tipe' => 'Beban', 'subtipe' => 'Operasional', 'saldoNormal' => 'Debit', 'pakai' => 3],
            ],
        ]);
    }

    public function openingBalance(): Response
    {
        return Inertia::render('opening-balance', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Setup Saldo Awal', 'href' => '/dashboard/setup/saldo-awal'],
            ],
            'defaultDate' => now()->startOfMonth()->toDateString(),
            'assetAccounts' => [
                ['kode' => '1101', 'nama' => 'Kas Utama', 'current' => 18400000],
                ['kode' => '1102', 'nama' => 'Bank BCA', 'current' => 32700000],
                ['kode' => '1120', 'nama' => 'Piutang Usaha', 'current' => 24500000],
            ],
            'liabilityAccounts' => [
                ['kode' => '2100', 'nama' => 'Hutang Usaha', 'current' => 28300000],
                ['kode' => '2200', 'nama' => 'Hutang Bank / Pinjaman', 'current' => 20500000],
            ],
            'fixedAssetCategories' => ['Peralatan', 'Kendaraan', 'Bangunan', 'Furniture', 'Lainnya'],
        ]);
    }

    public function storeAccount(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form bagan akun sudah diterima. Penyimpanan akun akan aktif setelah backend finansial dipindahkan.');
    }

    public function storeOpeningBalance(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form saldo awal sudah diterima. Jurnal pembukaan akan aktif setelah backend finansial dipindahkan.');
    }
}
