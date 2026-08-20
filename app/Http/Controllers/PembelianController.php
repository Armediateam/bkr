<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PembelianController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pembelian', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pembelian', 'href' => '/dashboard/pembelian'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunPersediaan' => [
                ['kode' => '1130', 'nama' => 'Persediaan Barang'],
                ['kode' => '1131', 'nama' => 'Bahan Mentah'],
                ['kode' => '1132', 'nama' => 'Bahan Olahan'],
            ],
            'akunAset' => [
                ['kode' => '1200', 'nama' => 'Peralatan'],
                ['kode' => '1210', 'nama' => 'Kendaraan'],
                ['kode' => '1220', 'nama' => 'Gedung & Bangunan'],
            ],
            'proyekAktif' => Project::query()
                ->select(['id', 'project_id', 'nama_proyek'])
                ->orderBy('nama_proyek')
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'kode' => $project->project_id,
                    'nama' => $project->nama_proyek,
                ]),
            'produkList' => [
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2600000, 'stok' => 5],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'hargaBeli' => 2100000, 'stok' => 7],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'hargaBeli' => 420000, 'stok' => 20],
            ],
            'vendorList' => ['CV Tirta Pool Supply', 'PT Aqua Teknik', 'Supplier Umum', 'Bengkel Peralatan Kolam'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'akun_kas' => ['nullable', 'string', 'max:20'],
            'akun_persediaan_kode' => ['nullable', 'string', 'max:20'],
            'akun_aset_kode' => ['nullable', 'string', 'max:20'],
            'vendor' => ['nullable', 'string', 'max:160'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'proyek_id' => ['nullable', 'integer', 'exists:projects,id'],
            'no_invoice_supplier' => ['nullable', 'string', 'max:80'],
            'no_faktur_pajak' => ['nullable', 'string', 'max:80'],
            'nominal' => ['nullable', 'numeric', 'min:0'],
            'uang_keluar' => ['nullable', 'numeric', 'min:0'],
            'jatuh_tempo' => ['nullable', 'date'],
            'non_sku_deskripsi' => ['nullable', 'string', 'max:180'],
            'non_sku_nilai' => ['nullable', 'numeric', 'min:0'],
        ]);

        $items = $this->purchaseItemsFromRequest($request);
        $itemsSubtotal = collect($items)->sum('subtotal');
        $nominal = (int) ($validated['nominal'] ?? 0);
        $subtotal = $itemsSubtotal > 0 ? $itemsSubtotal : $nominal;
        $ppn = (int) round($subtotal * (((float) $request->input('ppn_pct', 0)) / 100));
        $pph23 = (int) round($subtotal * (((float) $request->input('pph23_pct', 0)) / 100));
        $total = max(0, $subtotal + $ppn - $pph23);
        $paid = (int) ($validated['uang_keluar'] ?? $total);

        DB::transaction(function () use ($validated, $items, $subtotal, $ppn, $pph23, $total, $paid, $request): void {
            $transaction = FinancialTransaction::create([
                'type' => 'purchase',
                'number' => $this->nextTransactionNumber('PUR'),
                'transaction_date' => $validated['tanggal'],
                'cash_account_code' => $validated['akun_kas'] ?? null,
                'main_account_code' => $validated['akun_persediaan_kode'] ?? $validated['akun_aset_kode'] ?? null,
                'project_id' => $validated['proyek_id'] ?? null,
                'party_name' => $validated['vendor'] ?? 'Supplier Umum',
                'description' => $validated['keterangan'] ?? null,
                'supplier_invoice_number' => $validated['no_invoice_supplier'] ?? null,
                'tax_invoice_number' => $validated['no_faktur_pajak'] ?? null,
                'due_date' => $validated['jatuh_tempo'] ?? null,
                'subtotal' => $subtotal,
                'ppn' => $ppn,
                'pph23' => $pph23,
                'total' => $total,
                'paid_amount' => min($paid, $total),
                'outstanding_amount' => max(0, $total - $paid),
                'metadata' => $request->except(['item_nama', 'qty', 'harga_beli']),
            ]);

            $transaction->items()->createMany($items);
        });

        return back()->with('success', 'Pembelian berhasil disimpan ke database.');
    }

    private function purchaseItemsFromRequest(Request $request): array
    {
        $names = $request->input('item_nama', []);
        $quantities = $request->input('qty', []);
        $prices = $request->input('harga_beli', $request->input('harga', []));
        $items = collect($names)
            ->map(function ($name, int $index) use ($quantities, $prices): ?array {
                if (! $name) {
                    return null;
                }

                $quantity = (float) ($quantities[$index] ?? 1);
                $price = (int) ($prices[$index] ?? 0);

                return [
                    'name' => (string) $name,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'unit_cost' => $price,
                    'subtotal' => (int) round($quantity * $price),
                ];
            })
            ->filter()
            ->values();

        if ($request->filled('non_sku_deskripsi') && (int) $request->input('non_sku_nilai', 0) > 0) {
            $items->push([
                'name' => $request->string('non_sku_deskripsi')->toString(),
                'quantity' => 1,
                'unit_price' => (int) $request->input('non_sku_nilai'),
                'unit_cost' => (int) $request->input('non_sku_nilai'),
                'subtotal' => (int) $request->input('non_sku_nilai'),
            ]);
        }

        return $items->all();
    }

    private function nextTransactionNumber(string $prefix): string
    {
        return $prefix.'-'.now()->format('YmdHis');
    }
}
