<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('purchase-order', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Purchase Order', 'href' => '/dashboard/po'],
            ],
            'today' => now()->toDateString(),
            'nextNumber' => 'PO-'.now()->format('Ymd').'-001',
            'vendors' => [
                ['nama' => 'CV Tirta Pool Supply', 'alamat' => 'Jakarta', 'kontak' => '0812-0000-0001'],
                ['nama' => 'PT Aqua Teknik', 'alamat' => 'Bandung', 'kontak' => '0812-0000-0002'],
            ],
            'products' => [
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2600000],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2100000],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'hargaBeli' => 420000],
            ],
            'purchaseOrders' => [
                ['id' => 1, 'nomor' => 'PO-20260820-001', 'vendor' => 'CV Tirta Pool Supply', 'tanggal' => now()->toDateString(), 'expectedDate' => now()->addDays(5)->toDateString(), 'total' => 5200000, 'status' => 'DIKIRIM'],
                ['id' => 2, 'nomor' => 'PO-20260815-001', 'vendor' => 'PT Aqua Teknik', 'tanggal' => now()->subDays(5)->toDateString(), 'expectedDate' => now()->addDays(2)->toDateString(), 'total' => 2100000, 'status' => 'DITERIMA'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Purchase order sudah diterima. Penyimpanan PO, penerimaan barang, stok, dan hutang akan aktif setelah backend finansial dipindahkan.');
    }
}
