<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    public function hub(): Response
    {
        return Inertia::render('tax-hub', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
            ],
            'month' => now()->translatedFormat('F Y'),
            'summary' => [
                'ppnKeluaran' => 17897000,
                'ppnMasukan' => 6420000,
                'kurangBayar' => 11477000,
                'pph21' => 3150000,
                'pph23' => 980000,
                'bpjs' => 1725000,
            ],
            'balances' => $this->taxBalances(),
        ]);
    }

    public function payment(): Response
    {
        return Inertia::render('tax-payment', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Bayar Pajak/Gaji', 'href' => '/dashboard/pajak/setor'],
            ],
            'today' => now()->toDateString(),
            'payables' => [
                ['kode' => '2111', 'nama' => 'Hutang PPN', 'saldo' => 11477000],
                ['kode' => '2112', 'nama' => 'Hutang PPh Pasal 23', 'saldo' => 980000],
                ['kode' => '2110', 'nama' => 'Hutang PPh Badan', 'saldo' => 5600000],
                ['kode' => '2115', 'nama' => 'Hutang PPh Pasal 21', 'saldo' => 3150000],
                ['kode' => '2116', 'nama' => 'Hutang BPJS', 'saldo' => 1725000],
                ['kode' => '2120', 'nama' => 'Hutang Gaji', 'saldo' => 18400000],
            ],
            'cashAccounts' => $this->cashAccounts(),
            'ppnMasukan' => 6420000,
        ]);
    }

    public function pkpPurchase(): Response
    {
        return Inertia::render('tax-pkp-purchase', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Pembelian PKP', 'href' => '/dashboard/pajak/pembelian-pkp'],
            ],
            'today' => now()->toDateString(),
            'debitAccounts' => [
                ['kode' => '1130', 'nama' => 'Persediaan Barang'],
                ['kode' => '6100', 'nama' => 'Beban Operasional'],
                ['kode' => '1500', 'nama' => 'Peralatan Operasional'],
            ],
            'cashAccounts' => $this->cashAccounts(),
        ]);
    }

    public function sptVat(): Response
    {
        return Inertia::render('tax-spt-vat', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'SPT Masa PPN', 'href' => '/dashboard/pajak/spt-masa'],
            ],
            'month' => now()->translatedFormat('F'),
            'year' => now()->year,
            'ppnKeluaran' => [
                ['tanggal' => now()->subDays(12)->toDateString(), 'keterangan' => 'Invoice Hotel Samudra Biru', 'pihak' => 'Hotel Samudra Biru', 'nilai' => 7620000],
                ['tanggal' => now()->subDays(6)->toDateString(), 'keterangan' => 'Invoice PT Tirta Jernih Abadi', 'pihak' => 'PT Tirta Jernih Abadi', 'nilai' => 6150000],
                ['tanggal' => now()->subDays(2)->toDateString(), 'keterangan' => 'Penjualan POS PKP', 'pihak' => 'Customer Retail', 'nilai' => 4127000],
            ],
            'ppnMasukan' => [
                ['tanggal' => now()->subDays(10)->toDateString(), 'keterangan' => 'Pembelian chemical PKP', 'pihak' => 'CV Aqua Prima Supply', 'nilai' => 2750000],
                ['tanggal' => now()->subDays(4)->toDateString(), 'keterangan' => 'Pembelian sparepart PKP', 'pihak' => 'PT Pompa Nusantara', 'nilai' => 3670000],
            ],
            'setoran' => 0,
        ]);
    }

    public function pph22(): Response
    {
        return Inertia::render('tax-pph22', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Rekap PPh 22', 'href' => '/dashboard/pajak/pph22'],
            ],
            'month' => now()->translatedFormat('F'),
            'year' => now()->year,
            'withheld' => [
                ['tanggal' => now()->subDays(14)->toDateString(), 'pihak' => 'Dinas Pemuda dan Olahraga', 'keterangan' => 'Maintenance kolam instansi', 'dpp' => 24500000, 'pph22' => 367500],
                ['tanggal' => now()->subDays(5)->toDateString(), 'pihak' => 'BUMN Tirta Properti', 'keterangan' => 'Pengadaan chemical', 'dpp' => 18600000, 'pph22' => 279000],
            ],
            'reversed' => [
                ['tanggal' => now()->subDays(2)->toDateString(), 'keterangan' => 'Kompensasi pajak dibayar dimuka', 'nilai' => 125000],
            ],
        ]);
    }

    public function withholdingIn(): Response
    {
        return Inertia::render('tax-withholding-in', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Bukti Potong PPh23', 'href' => '/dashboard/pajak/bukti-potong'],
            ],
            'rows' => [
                ['id' => 1, 'nomor' => 'BP-202608-001', 'tanggal' => now()->subDays(12)->toDateString(), 'pemotong' => 'Hotel Samudra Biru', 'npwp' => '01.234.567.8-901.000', 'dpp' => 14800000, 'pph23' => 296000, 'status' => 'Siap Cetak'],
                ['id' => 2, 'nomor' => 'BP-202608-002', 'tanggal' => now()->subDays(6)->toDateString(), 'pemotong' => 'PT Tirta Jernih Abadi', 'npwp' => '02.345.678.9-012.000', 'dpp' => 6800000, 'pph23' => 136000, 'status' => 'Siap Cetak'],
            ],
        ]);
    }

    public function withholdingOut(): Response
    {
        return Inertia::render('tax-withholding-out', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Bukti Potong Keluar', 'href' => '/dashboard/pajak/bukti-potong-keluar'],
            ],
            'rows' => [
                ['id' => 1, 'nomor' => 'BPK-202608-001', 'tanggal' => now()->subDays(10)->toDateString(), 'supplier' => 'CV Aqua Prima Supply', 'npwp' => '31.456.789.0-123.000', 'dpp' => 11500000, 'pph23' => 230000, 'status' => 'Tercatat'],
                ['id' => 2, 'nomor' => 'BPK-202608-002', 'tanggal' => now()->subDays(4)->toDateString(), 'supplier' => 'PT Pompa Nusantara', 'npwp' => '32.567.890.1-234.000', 'dpp' => 36800000, 'pph23' => 736000, 'status' => 'Tercatat'],
            ],
        ]);
    }

    public function paymentProof(): Response
    {
        return Inertia::render('tax-payment-proof', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hub Pajak', 'href' => '/dashboard/pajak'],
                ['title' => 'Bukti Bayar Pajak', 'href' => '/dashboard/pajak/bukti-bayar'],
            ],
            'rows' => [
                ['id' => 1, 'tanggal' => now()->subDays(18)->toDateString(), 'nomor' => 'NTPN-0826-001', 'jenis' => 'PPh 21', 'akun' => '2115 - Hutang PPh Pasal 21', 'nominal' => 2950000, 'kas' => 'Bank BCA'],
                ['id' => 2, 'tanggal' => now()->subDays(7)->toDateString(), 'nomor' => 'NTPN-0826-002', 'jenis' => 'PPh 23', 'akun' => '2112 - Hutang PPh Pasal 23', 'nominal' => 840000, 'kas' => 'Bank BCA'],
            ],
        ]);
    }

    public function storePayment(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pembayaran pajak/gaji sudah diterima. Penyimpanan jurnal pajak akan aktif setelah backend finansial dipindahkan.');
    }

    public function storePkpPurchase(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pembelian PKP sudah diterima. Penyimpanan PPN/PPh akan aktif setelah backend finansial dipindahkan.');
    }

    private function cashAccounts(): array
    {
        return [
            ['kode' => '1101', 'nama' => 'Kas Utama'],
            ['kode' => '1102', 'nama' => 'Bank BCA'],
            ['kode' => '1103', 'nama' => 'Bank Mandiri'],
        ];
    }

    private function taxBalances(): array
    {
        return [
            ['kode' => '2111', 'nama' => 'Hutang PPN', 'status' => 'Wajib Setor', 'saldo' => 11477000],
            ['kode' => '2112', 'nama' => 'Hutang PPh Pasal 23', 'status' => 'Wajib Setor', 'saldo' => 980000],
            ['kode' => '2110', 'nama' => 'Hutang PPh Badan', 'status' => 'Wajib Setor', 'saldo' => 5600000],
            ['kode' => '2115', 'nama' => 'Hutang PPh Pasal 21', 'status' => 'Wajib Setor', 'saldo' => 3150000],
            ['kode' => '2116', 'nama' => 'Hutang BPJS', 'status' => 'Wajib Setor', 'saldo' => 1725000],
            ['kode' => '2120', 'nama' => 'Hutang Gaji', 'status' => 'Wajib Bayar', 'saldo' => 18400000],
            ['kode' => '1180', 'nama' => 'PPN Masukan', 'status' => 'Bisa Kreditkan', 'saldo' => 6420000],
            ['kode' => '1181', 'nama' => 'PPh 23 Dibayar Dimuka', 'status' => 'Klaim SPT Tahunan', 'saldo' => 432000],
        ];
    }
}
