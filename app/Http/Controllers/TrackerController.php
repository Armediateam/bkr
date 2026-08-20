<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackerController extends Controller
{
    public function transactions(): Response
    {
        return Inertia::render('tracker-transactions', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Daftar Transaksi', 'href' => '/dashboard/daftar-transaksi'],
            ],
            'dateFrom' => now()->startOfMonth()->toDateString(),
            'dateTo' => now()->toDateString(),
            'transactions' => [
                ['id' => 'TRX-2026-0818-001', 'tanggal' => now()->subDays(2)->toDateString(), 'keterangan' => 'Penjualan chemical dan jasa vacuum', 'pihak' => 'PT Tirta Jernih Abadi', 'jenis' => 'Penjualan', 'nominal' => 6800000, 'kas' => 2300000, 'labaRugi' => 1900000, 'sisaTagihan' => 4500000, 'source' => 'Invoice'],
                ['id' => 'TRX-2026-0816-004', 'tanggal' => now()->subDays(4)->toDateString(), 'keterangan' => 'Pembelian kaporit dan soda ash', 'pihak' => 'CV Aqua Prima Supply', 'jenis' => 'Pembelian', 'nominal' => 11500000, 'kas' => 0, 'labaRugi' => 0, 'sisaTagihan' => 11500000, 'source' => 'PO'],
                ['id' => 'TRX-2026-0815-002', 'tanggal' => now()->subDays(5)->toDateString(), 'keterangan' => 'Transfer kas utama ke Bank BCA', 'pihak' => null, 'jenis' => 'Transfer Rekening', 'nominal' => 15000000, 'kas' => 0, 'labaRugi' => 0, 'sisaTagihan' => 0, 'source' => 'Kas'],
                ['id' => 'TRX-2026-0813-003', 'tanggal' => now()->subDays(7)->toDateString(), 'keterangan' => 'Pembayaran piutang Villa Cemara Indah', 'pihak' => 'Villa Cemara Indah', 'jenis' => 'Penerimaan Piutang', 'nominal' => 4200000, 'kas' => 4200000, 'labaRugi' => 0, 'sisaTagihan' => 0, 'source' => 'Pelunasan'],
            ],
        ]);
    }

    public function receivables(): Response
    {
        return Inertia::render('tracker-receivables', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Piutang', 'href' => '/dashboard/piutang'],
            ],
            'today' => now()->toDateString(),
            'cashAccounts' => $this->cashAccounts(),
            'rows' => [
                ['id' => 1, 'tanggal' => now()->subDays(20)->toDateString(), 'customer' => 'PT Tirta Jernih Abadi', 'keterangan' => 'Invoice INV-2026-0818-001', 'jumlah' => 6800000, 'terbayar' => 2300000, 'jatuhTempo' => now()->subDays(2)->toDateString(), 'status' => 'BELUM LUNAS'],
                ['id' => 2, 'tanggal' => now()->subDays(9)->toDateString(), 'customer' => 'Villa Cemara Indah', 'keterangan' => 'Penggantian filter cartridge', 'jumlah' => 7200000, 'terbayar' => 0, 'jatuhTempo' => now()->addDays(4)->toDateString(), 'status' => 'BELUM LUNAS'],
                ['id' => 3, 'tanggal' => now()->subDays(35)->toDateString(), 'customer' => 'Hotel Samudra Biru', 'keterangan' => 'Paket maintenance bulanan', 'jumlah' => 14800000, 'terbayar' => 14800000, 'jatuhTempo' => now()->subDays(5)->toDateString(), 'status' => 'LUNAS'],
            ],
        ]);
    }

    public function payables(): Response
    {
        return Inertia::render('tracker-payables', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Hutang', 'href' => '/dashboard/hutang'],
            ],
            'today' => now()->toDateString(),
            'cashAccounts' => $this->cashAccounts(),
            'rows' => [
                ['id' => 1, 'tanggal' => now()->subDays(16)->toDateString(), 'vendor' => 'CV Aqua Prima Supply', 'keterangan' => 'Pembelian kaporit dan soda ash', 'jumlah' => 11500000, 'terbayar' => 0, 'jatuhTempo' => now()->subDays(1)->toDateString(), 'status' => 'BELUM LUNAS'],
                ['id' => 2, 'tanggal' => now()->subDays(10)->toDateString(), 'vendor' => 'PT Pompa Nusantara', 'keterangan' => 'Pompa Hayward dan valve', 'jumlah' => 36800000, 'terbayar' => 20000000, 'jatuhTempo' => now()->addDays(6)->toDateString(), 'status' => 'BELUM LUNAS'],
                ['id' => 3, 'tanggal' => now()->subDays(24)->toDateString(), 'vendor' => 'UD Mandiri Teknik', 'keterangan' => 'Seal, fitting, dan clamp', 'jumlah' => 4200000, 'terbayar' => 4200000, 'jatuhTempo' => now()->subDays(12)->toDateString(), 'status' => 'LUNAS'],
            ],
        ]);
    }

    public function payReceivable(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pembayaran piutang sudah diterima. Penyimpanan pelunasan akan aktif setelah backend finansial dipindahkan.');
    }

    public function writeOffReceivable(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form write-off piutang sudah diterima. Jurnal write-off akan aktif setelah backend finansial dipindahkan.');
    }

    public function payPayable(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pembayaran hutang sudah diterima. Penyimpanan pelunasan akan aktif setelah backend finansial dipindahkan.');
    }

    private function cashAccounts(): array
    {
        return [
            ['kode' => '1101', 'nama' => 'Kas Utama'],
            ['kode' => '1102', 'nama' => 'Bank BCA'],
            ['kode' => '1103', 'nama' => 'Bank Mandiri'],
        ];
    }
}
