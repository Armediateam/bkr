<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceMenuController extends Controller
{
    /**
     * @var array<string, array{title: string, section: string, source: string}>
     */
    private array $menus = [
        'pembelian' => ['title' => 'Pembelian', 'section' => 'Input Transaksi', 'source' => 'pembelian.html'],
        'pengeluaran' => ['title' => 'Pengeluaran', 'section' => 'Input Transaksi', 'source' => 'pengeluaran.html'],
        'retur-penjualan' => ['title' => 'Retur', 'section' => 'Input Transaksi', 'source' => 'retur_penjualan.html'],
        'pelunasan' => ['title' => 'Pelunasan', 'section' => 'Input Transaksi', 'source' => 'pelunasan.html'],
        'transfer-rekening' => ['title' => 'Transfer Rekening', 'section' => 'Input Transaksi', 'source' => 'transfer_rekening.html'],
        'pendanaan' => ['title' => 'Pendanaan', 'section' => 'Input Transaksi', 'source' => 'pendanaan.html'],
        'import-marketplace' => ['title' => 'Import Marketplace', 'section' => 'Input Transaksi', 'source' => 'import_marketplace.html'],
        'pos' => ['title' => 'POS Kasir', 'section' => 'POS', 'source' => 'pos_kasir.html'],
        'pos/master' => ['title' => 'Master POS', 'section' => 'POS', 'source' => 'pos_master.html'],
        'invoice' => ['title' => 'Invoice', 'section' => 'Dokumen', 'source' => 'invoice_list.html'],
        'po' => ['title' => 'Purchase Order', 'section' => 'Dokumen', 'source' => 'po_list.html'],
        'database/customer' => ['title' => 'Customer', 'section' => 'Operasional', 'source' => 'db_customer.html'],
        'database/vendor' => ['title' => 'Vendor', 'section' => 'Operasional', 'source' => 'db_vendor.html'],
        'stok' => ['title' => 'Inventory', 'section' => 'Operasional', 'source' => 'stok.html'],
        'produksi' => ['title' => 'Produksi', 'section' => 'Operasional', 'source' => 'produksi.html'],
        'kalkulator-hpp' => ['title' => 'Master HPP', 'section' => 'Operasional', 'source' => 'hpp_kalkulator.html'],
        'daftar-transaksi' => ['title' => 'Daftar Transaksi', 'section' => 'Monitoring', 'source' => 'daftar_transaksi.html'],
        'piutang' => ['title' => 'Piutang', 'section' => 'Monitoring', 'source' => 'piutang.html'],
        'hutang' => ['title' => 'Hutang', 'section' => 'Monitoring', 'source' => 'hutang.html'],
        'transaksi' => ['title' => 'Jurnal', 'section' => 'Monitoring', 'source' => 'transaksi.html'],
        'log' => ['title' => 'Log Aktivitas', 'section' => 'Monitoring', 'source' => 'log.html'],
        'laba-rugi' => ['title' => 'Laba Rugi', 'section' => 'Laporan', 'source' => 'laba_rugi.html'],
        'arus-kas' => ['title' => 'Arus Kas', 'section' => 'Laporan', 'source' => 'arus_kas.html'],
        'neraca' => ['title' => 'Neraca', 'section' => 'Laporan', 'source' => 'neraca.html'],
        'perubahan-ekuitas' => ['title' => 'Perubahan Ekuitas', 'section' => 'Laporan', 'source' => 'perubahan_ekuitas.html'],
        'analisis-rasio' => ['title' => 'Analisis Rasio', 'section' => 'Laporan', 'source' => 'analisis_rasio.html'],
        'buku-besar' => ['title' => 'Buku Besar', 'section' => 'Laporan', 'source' => 'buku_besar.html'],
        'performa-penjualan' => ['title' => 'Performa Penjualan', 'section' => 'Laporan', 'source' => 'performa_penjualan.html'],
        'charts' => ['title' => 'Grafik', 'section' => 'Laporan', 'source' => 'charts.html'],
        'aset-tetap' => ['title' => 'Aset Tetap', 'section' => 'Laporan', 'source' => 'aset_tetap.html'],
        'bagan-akun' => ['title' => 'Bagan Akun', 'section' => 'Akuntansi', 'source' => 'akun.html'],
        'setup/saldo-awal' => ['title' => 'Setup Saldo Awal', 'section' => 'Akuntansi', 'source' => 'saldo_awal.html'],
        'pajak' => ['title' => 'Hub Pajak', 'section' => 'Pajak', 'source' => 'pajak_hub.html'],
        'pajak/setor' => ['title' => 'Bayar Pajak/Gaji', 'section' => 'Pajak', 'source' => 'pajak_setor.html'],
        'pajak/pembelian-pkp' => ['title' => 'Pembelian PKP', 'section' => 'Pajak', 'source' => 'pajak_pembelian.html'],
        'pajak/spt-masa' => ['title' => 'SPT Masa PPN', 'section' => 'Pajak', 'source' => 'pajak_spt_masa.html'],
        'pajak/pph22' => ['title' => 'Rekap PPh 22', 'section' => 'Pajak', 'source' => 'pajak_pph22.html'],
        'pajak/bukti-potong' => ['title' => 'Bukti Potong PPh23', 'section' => 'Pajak', 'source' => 'pajak_bukti_potong_list.html'],
        'pajak/bukti-potong-keluar' => ['title' => 'Bukti Potong Keluar', 'section' => 'Pajak', 'source' => 'pajak_bukti_potong_keluar_list.html'],
        'pajak/bukti-bayar' => ['title' => 'Bukti Bayar Pajak', 'section' => 'Pajak', 'source' => 'pajak_bukti_bayar_list.html'],
        'gaji/karyawan' => ['title' => 'Data Karyawan', 'section' => 'Gaji', 'source' => 'gaji_karyawan.html'],
        'gaji/proses' => ['title' => 'Proses Gaji', 'section' => 'Gaji', 'source' => 'gaji_proses.html'],
        'gaji/riwayat' => ['title' => 'Riwayat Gaji', 'section' => 'Gaji', 'source' => 'gaji_riwayat.html'],
        'anggaran' => ['title' => 'Anggaran & Target', 'section' => 'Anggaran', 'source' => 'anggaran.html'],
        'pengaturan/modul' => ['title' => 'Modul Lanjutan', 'section' => 'Modul', 'source' => 'modul_pro.html'],
    ];

    public function show(Request $request): Response
    {
        $path = trim($request->path(), '/');
        $menuPath = str($path)->after('dashboard/')->toString();
        $menu = $this->menus[$menuPath] ?? [
            'title' => 'Menu Finansial',
            'section' => 'Finansial',
            'source' => null,
        ];

        return Inertia::render('finance-menu-placeholder', [
            ...$menu,
            'href' => '/dashboard/'.$menuPath,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => $menu['title'], 'href' => '/dashboard/'.$menuPath],
            ],
        ]);
    }
}
