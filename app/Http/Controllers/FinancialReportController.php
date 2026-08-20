<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    public function profitLoss(): Response
    {
        $pendapatan = [
            ['akun' => '4100 - Pendapatan Penjualan', 'nilai' => 128500000],
            ['akun' => '4200 - Pendapatan Jasa Maintenance', 'nilai' => 34200000],
        ];
        $beban = [
            ['akun' => '5100 - Harga Pokok Penjualan', 'nilai' => 91700000],
            ['akun' => '6100 - Beban Operasional', 'nilai' => 18450000],
            ['akun' => '6200 - Beban Gaji', 'nilai' => 12500000],
            ['akun' => '6300 - Beban Pajak', 'nilai' => 3200000],
        ];

        return Inertia::render('report-profit-loss', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Laba Rugi', 'href' => '/dashboard/laba-rugi'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'pendapatan' => $pendapatan,
            'beban' => $beban,
            'summary' => [
                'pendapatan' => collect($pendapatan)->sum('nilai'),
                'hpp' => 91700000,
                'bebanOperasional' => 30950000,
                'pajak' => 3200000,
            ],
        ]);
    }

    public function cashFlow(): Response
    {
        return Inertia::render('report-cash-flow', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Arus Kas', 'href' => '/dashboard/arus-kas'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'saldoAwal' => 42800000,
            'sections' => [
                ['kategori' => 'Aktivitas Operasional', 'rows' => [
                    ['label' => 'Penerimaan dari customer', 'masuk' => 96500000, 'keluar' => 0],
                    ['label' => 'Pembayaran vendor dan operasional', 'masuk' => 0, 'keluar' => 68400000],
                    ['label' => 'Pembayaran gaji dan pajak', 'masuk' => 0, 'keluar' => 15700000],
                ]],
                ['kategori' => 'Aktivitas Investasi', 'rows' => [
                    ['label' => 'Pembelian aset tetap', 'masuk' => 0, 'keluar' => 12000000],
                ]],
                ['kategori' => 'Aktivitas Pendanaan', 'rows' => [
                    ['label' => 'Setoran modal pemilik', 'masuk' => 10000000, 'keluar' => 0],
                    ['label' => 'Pembayaran pinjaman', 'masuk' => 0, 'keluar' => 4500000],
                ]],
            ],
        ]);
    }

    public function balanceSheet(): Response
    {
        return Inertia::render('report-balance-sheet', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Neraca', 'href' => '/dashboard/neraca'],
            ],
            'dateTo' => now()->toDateString(),
            'aset' => [
                ['kelompok' => 'Aset Lancar', 'rows' => [
                    ['akun' => '1101 - Kas Utama', 'nilai' => 18400000],
                    ['akun' => '1102 - Bank BCA', 'nilai' => 32700000],
                    ['akun' => '1120 - Piutang Usaha', 'nilai' => 24500000],
                    ['akun' => '1130 - Persediaan Barang', 'nilai' => 48750000],
                ]],
                ['kelompok' => 'Aset Tetap', 'rows' => [
                    ['akun' => '1500 - Peralatan Operasional', 'nilai' => 56000000],
                ]],
            ],
            'liabilitas' => [
                ['kelompok' => 'Liabilitas Lancar', 'rows' => [
                    ['akun' => '2100 - Hutang Usaha', 'nilai' => 28300000],
                    ['akun' => '2200 - Hutang Bank / Pinjaman', 'nilai' => 20500000],
                ]],
            ],
            'ekuitas' => [
                ['akun' => '3100 - Modal Pemilik', 'nilai' => 82000000],
                ['akun' => '3200 - Laba Ditahan', 'nilai' => 49250000],
            ],
        ]);
    }

    public function equityChanges(): Response
    {
        return Inertia::render('report-equity-changes', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Perubahan Ekuitas', 'href' => '/dashboard/perubahan-ekuitas'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'rows' => [
                ['label' => 'Modal awal periode', 'type' => 'opening', 'amount' => 114500000],
                ['label' => 'Setoran modal pemilik', 'type' => 'addition', 'amount' => 10000000],
                ['label' => 'Prive / pengambilan pemilik', 'type' => 'deduction', 'amount' => -4500000],
                ['label' => 'Laba ditahan sebelum periode', 'type' => 'retained', 'amount' => 49250000],
                ['label' => 'Laba bersih periode berjalan', 'type' => 'profit', 'amount' => 26750000],
            ],
        ]);
    }

    public function ratioAnalysis(): Response
    {
        return Inertia::render('report-ratio-analysis', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Analisis Rasio', 'href' => '/dashboard/analisis-rasio'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'summary' => [
                ['label' => 'Likuiditas', 'value' => '2.56x', 'note' => 'Current Ratio'],
                ['label' => 'Solvabilitas', 'value' => '0.37x', 'note' => 'Debt to Equity'],
                ['label' => 'Profitabilitas', 'value' => '20.2%', 'note' => 'ROE'],
                ['label' => 'Margin Bersih', 'value' => '16.4%', 'note' => 'Net Profit Margin'],
            ],
            'groups' => [
                ['title' => 'Rasio Likuiditas', 'description' => 'Kemampuan memenuhi kewajiban jangka pendek.', 'ratios' => [
                    ['name' => 'Current Ratio', 'value' => '2.56x', 'status' => 'Sehat', 'formula' => 'Aset Lancar / Liabilitas Lancar'],
                    ['name' => 'Quick Ratio', 'value' => '1.54x', 'status' => 'Sehat', 'formula' => '(Aset Lancar - Persediaan) / Liabilitas Lancar'],
                ]],
                ['title' => 'Rasio Solvabilitas', 'description' => 'Struktur hutang terhadap modal dan aset.', 'ratios' => [
                    ['name' => 'Debt to Equity (DER)', 'value' => '0.37x', 'status' => 'Aman', 'formula' => 'Total Liabilitas / Total Ekuitas'],
                    ['name' => 'Debt to Asset', 'value' => '27.2%', 'status' => 'Aman', 'formula' => 'Total Liabilitas / Total Aset'],
                ]],
                ['title' => 'Rasio Profitabilitas', 'description' => 'Kemampuan menghasilkan laba dari penjualan, aset, dan ekuitas.', 'ratios' => [
                    ['name' => 'Gross Profit Margin', 'value' => '43.6%', 'status' => 'Baik', 'formula' => 'Laba Kotor / Pendapatan'],
                    ['name' => 'Net Profit Margin', 'value' => '16.4%', 'status' => 'Baik', 'formula' => 'Laba Bersih / Pendapatan'],
                    ['name' => 'ROA', 'value' => '14.8%', 'status' => 'Baik', 'formula' => 'Laba Bersih / Total Aset'],
                    ['name' => 'ROE', 'value' => '20.2%', 'status' => 'Baik', 'formula' => 'Laba Bersih / Total Ekuitas'],
                    ['name' => 'Inventory Turnover', 'value' => '1.88x', 'status' => 'Perlu Dipantau', 'formula' => 'HPP / Persediaan'],
                ]],
            ],
            'source' => [
                ['label' => 'Aset Lancar', 'value' => 124350000],
                ['label' => 'Liabilitas Lancar', 'value' => 48600000],
                ['label' => 'Pendapatan', 'value' => 162700000],
                ['label' => 'HPP', 'value' => 91700000],
                ['label' => 'Laba Bersih', 'value' => 26750000],
            ],
        ]);
    }

    public function generalLedger(): Response
    {
        return Inertia::render('report-general-ledger', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Buku Besar', 'href' => '/dashboard/buku-besar'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'accounts' => [
                ['kode' => '1101', 'nama' => 'Kas Utama', 'tipe' => 'Aset', 'saldoNormal' => 'Debit'],
                ['kode' => '1120', 'nama' => 'Piutang Usaha', 'tipe' => 'Aset', 'saldoNormal' => 'Debit'],
                ['kode' => '2100', 'nama' => 'Hutang Usaha', 'tipe' => 'Liabilitas', 'saldoNormal' => 'Kredit'],
                ['kode' => '4100', 'nama' => 'Pendapatan Penjualan', 'tipe' => 'Pendapatan', 'saldoNormal' => 'Kredit'],
            ],
            'selectedAccount' => ['kode' => '1101', 'nama' => 'Kas Utama', 'tipe' => 'Aset', 'saldoNormal' => 'Debit'],
            'openingBalance' => 18400000,
            'entries' => [
                ['tanggal' => now()->subDays(10)->toDateString(), 'ref' => 'JR-2026-0810-001', 'keterangan' => 'Saldo awal periode', 'debit' => 0, 'kredit' => 0, 'saldo' => 18400000],
                ['tanggal' => now()->subDays(7)->toDateString(), 'ref' => 'JR-2026-0813-003', 'keterangan' => 'Penerimaan piutang Villa Cemara Indah', 'debit' => 4200000, 'kredit' => 0, 'saldo' => 22600000],
                ['tanggal' => now()->subDays(5)->toDateString(), 'ref' => 'TRF-0815', 'keterangan' => 'Transfer ke Bank BCA', 'debit' => 0, 'kredit' => 15000000, 'saldo' => 7600000],
                ['tanggal' => now()->subDays(2)->toDateString(), 'ref' => 'INV-2026-0818-001', 'keterangan' => 'Penerimaan tunai penjualan', 'debit' => 2300000, 'kredit' => 0, 'saldo' => 9900000],
            ],
        ]);
    }

    public function salesPerformance(): Response
    {
        return Inertia::render('report-sales-performance', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Performa Penjualan', 'href' => '/dashboard/performa-penjualan'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'totals' => [
                'omzetNet' => 128500000,
                'margin' => 36800000,
                'marginPct' => 28.6,
                'qtyNet' => 412,
                'activeProducts' => 18,
                'retur' => 6200000,
                'hppNet' => 91700000,
            ],
            'categories' => [
                ['kategori' => 'Chemical', 'produk' => 8, 'omzet' => 74500000, 'kontribusi' => 58.0, 'margin' => 21200000],
                ['kategori' => 'Jasa Maintenance', 'produk' => 4, 'omzet' => 34200000, 'kontribusi' => 26.6, 'margin' => 12400000],
                ['kategori' => 'Sparepart', 'produk' => 6, 'omzet' => 19800000, 'kontribusi' => 15.4, 'margin' => 3200000],
            ],
            'products' => [
                ['produk' => 'Kaporit Granular 90%', 'kategori' => 'Chemical', 'qty' => 185, 'omzet' => 9620000, 'hpp' => 6660000, 'margin' => 2960000],
                ['produk' => 'Paket Chemical Weekly', 'kategori' => 'Chemical', 'qty' => 74, 'omzet' => 24050000, 'hpp' => 13172000, 'margin' => 10878000],
                ['produk' => 'Jasa Vacuum + Chemical', 'kategori' => 'Jasa Maintenance', 'qty' => 52, 'omzet' => 23400000, 'hpp' => 9620000, 'margin' => 13780000],
                ['produk' => 'Filter Cartridge C-7468', 'kategori' => 'Sparepart', 'qty' => 31, 'omzet' => 10695000, 'hpp' => 7285000, 'margin' => 3410000],
            ],
            'customers' => [
                ['customer' => 'Hotel Samudra Biru', 'transaksi' => 8, 'omzet' => 36800000, 'margin' => 9200000, 'aov' => 4600000],
                ['customer' => 'PT Tirta Jernih Abadi', 'transaksi' => 11, 'omzet' => 34200000, 'margin' => 9800000, 'aov' => 3109000],
                ['customer' => 'Villa Cemara Indah', 'transaksi' => 6, 'omzet' => 18400000, 'margin' => 5100000, 'aov' => 3067000],
            ],
            'monthly' => [
                ['periode' => 'Apr 2026', 'transaksi' => 28, 'penjualan' => 88500000, 'retur' => 2300000, 'net' => 86200000],
                ['periode' => 'Mei 2026', 'transaksi' => 34, 'penjualan' => 104200000, 'retur' => 4100000, 'net' => 100100000],
                ['periode' => 'Jun 2026', 'transaksi' => 31, 'penjualan' => 96800000, 'retur' => 2800000, 'net' => 94000000],
                ['periode' => 'Jul 2026', 'transaksi' => 39, 'penjualan' => 118900000, 'retur' => 5200000, 'net' => 113700000],
                ['periode' => 'Agu 2026', 'transaksi' => 36, 'penjualan' => 134700000, 'retur' => 6200000, 'net' => 128500000],
            ],
        ]);
    }

    public function charts(): Response
    {
        return Inertia::render('report-charts', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Grafik', 'href' => '/dashboard/charts'],
            ],
            'kpis' => [
                ['label' => 'Pendapatan', 'value' => 162700000, 'note' => '12 bulan terakhir'],
                ['label' => 'Laba Bersih', 'value' => 26750000, 'note' => 'Untung'],
                ['label' => 'Saldo Kas & Bank', 'value' => 51100000, 'note' => 'Saldo saat ini'],
                ['label' => 'Laba Ditahan', 'value' => 49250000, 'note' => 'Kumulatif'],
            ],
            'monthly' => [
                ['periode' => 'Mar', 'pendapatan' => 82000000, 'labaKotor' => 31500000, 'labaOperasional' => 17600000, 'labaBersih' => 14200000, 'kas' => 38600000],
                ['periode' => 'Apr', 'pendapatan' => 88500000, 'labaKotor' => 34400000, 'labaOperasional' => 19300000, 'labaBersih' => 15800000, 'kas' => 42100000],
                ['periode' => 'Mei', 'pendapatan' => 104200000, 'labaKotor' => 41800000, 'labaOperasional' => 24100000, 'labaBersih' => 20100000, 'kas' => 46800000],
                ['periode' => 'Jun', 'pendapatan' => 96800000, 'labaKotor' => 37600000, 'labaOperasional' => 21900000, 'labaBersih' => 18100000, 'kas' => 45200000],
                ['periode' => 'Jul', 'pendapatan' => 118900000, 'labaKotor' => 48200000, 'labaOperasional' => 28600000, 'labaBersih' => 23600000, 'kas' => 49300000],
                ['periode' => 'Agu', 'pendapatan' => 162700000, 'labaKotor' => 71000000, 'labaOperasional' => 29950000, 'labaBersih' => 26750000, 'kas' => 51100000],
            ],
        ]);
    }

    public function fixedAssets(): Response
    {
        return Inertia::render('report-fixed-assets', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Aset Tetap', 'href' => '/dashboard/aset-tetap'],
            ],
            'assets' => [
                ['id' => 1, 'nama' => 'Mesin Vacuum Kolam Pro', 'kategori' => 'Peralatan', 'tanggalBeli' => now()->subMonths(14)->toDateString(), 'hargaBeli' => 18500000, 'penyusutanBulanan' => 385417, 'terealisasi' => 5395838, 'nilaiBuku' => 13104162, 'umurBulan' => 48],
                ['id' => 2, 'nama' => 'Kendaraan Operasional Pickup', 'kategori' => 'Kendaraan', 'tanggalBeli' => now()->subMonths(22)->toDateString(), 'hargaBeli' => 148000000, 'penyusutanBulanan' => 2055556, 'terealisasi' => 45222232, 'nilaiBuku' => 102777768, 'umurBulan' => 72],
                ['id' => 3, 'nama' => 'Pressure Test Kit', 'kategori' => 'Peralatan', 'tanggalBeli' => now()->subMonths(7)->toDateString(), 'hargaBeli' => 6200000, 'penyusutanBulanan' => 172222, 'terealisasi' => 1205554, 'nilaiBuku' => 4994446, 'umurBulan' => 36],
            ],
        ]);
    }
}
