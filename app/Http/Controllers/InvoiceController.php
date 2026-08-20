<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('invoice', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Invoice', 'href' => '/dashboard/invoice'],
            ],
            'today' => now()->toDateString(),
            'nextNumber' => 'INV-'.now()->format('Ymd').'-001',
            'customers' => ['Villa Samudra Management', 'Blue Lagoon Hospitality', 'Tirta Kencana Club'],
            'products' => [
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'harga' => 3500000],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'harga' => 2800000],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'harga' => 750000],
            ],
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
            ],
            'invoices' => [
                ['id' => 1, 'nomor' => 'INV-20260820-001', 'tanggal' => now()->toDateString(), 'pelanggan' => 'Villa Samudra Management', 'total' => 6300000, 'jatuhTempo' => now()->addDays(30)->toDateString(), 'status' => 'SENT', 'jurnalId' => null],
                ['id' => 2, 'nomor' => 'INV-20260818-001', 'tanggal' => now()->subDays(2)->toDateString(), 'pelanggan' => 'Blue Lagoon Hospitality', 'total' => 2800000, 'jatuhTempo' => now()->addDays(14)->toDateString(), 'status' => 'PAID', 'jurnalId' => 120],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Invoice sudah diterima. Penyimpanan dokumen, status, pembayaran, dan jurnal invoice akan aktif setelah backend finansial dipindahkan.');
    }
}
