<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PemasukanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pemasukan', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Penjualan', 'href' => '/dashboard/pemasukan'],
            ],
            'today' => now()->toDateString(),
            'saldoPersediaan' => 0,
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunPendapatan' => [
                ['kode' => '4100', 'nama' => 'Pendapatan Penjualan'],
                ['kode' => '4200', 'nama' => 'Pendapatan Jasa'],
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
                ['id' => 1, 'nama' => 'Pompa Kolam Renang', 'satuan' => 'unit', 'harga' => 3500000, 'hpp' => 2600000, 'stok' => 5],
                ['id' => 2, 'nama' => 'Filter Kolam Renang', 'satuan' => 'unit', 'harga' => 2800000, 'hpp' => 2100000, 'stok' => 7],
                ['id' => 3, 'nama' => 'Chemical Treatment', 'satuan' => 'paket', 'harga' => 750000, 'hpp' => 420000, 'stok' => 20],
            ],
            'customerList' => ['Walk-in Customer', 'Villa Samudra Management', 'Blue Lagoon Hospitality', 'Tirta Kencana Club'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'akun_kas' => ['nullable', 'string', 'max:20'],
            'akun_pendapatan_kode' => ['nullable', 'string', 'max:20'],
            'proyek_id' => ['nullable', 'integer', 'exists:projects,id'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'pelanggan' => ['nullable', 'string', 'max:160'],
            'uang_masuk' => ['nullable', 'numeric', 'min:0'],
            'diskon' => ['nullable', 'numeric', 'min:0'],
            'ongkir' => ['nullable', 'numeric', 'min:0'],
            'biaya_lain' => ['nullable', 'numeric', 'min:0'],
            'biaya_mp' => ['nullable', 'numeric', 'min:0'],
            'jatuh_tempo' => ['nullable', 'date'],
        ]);

        $items = $this->salesItemsFromRequest($request);
        $subtotal = collect($items)->sum('subtotal');
        $discount = (int) ($validated['diskon'] ?? 0);
        $shipping = (int) ($validated['ongkir'] ?? 0);
        $otherFee = (int) ($validated['biaya_lain'] ?? 0);
        $marketplaceFee = (int) ($validated['biaya_mp'] ?? 0);
        $taxBase = max(0, $subtotal - $discount + $shipping + $otherFee);
        $ppn = (int) round($taxBase * (((float) $request->input('ppn_pct', 0)) / 100));
        $pph22 = (int) round($taxBase * (((float) $request->input('pph22_pct', 0)) / 100));
        $pph23 = (int) round($taxBase * (((float) $request->input('pph23_pct', 0)) / 100));
        $total = max(0, $taxBase + $ppn - $pph22 - $pph23 - $marketplaceFee);
        $paid = (int) ($validated['uang_masuk'] ?? $total);
        $hppTotal = collect($items)->sum(fn (array $item): int => $item['unit_cost'] * (int) $item['quantity']);

        DB::transaction(function () use ($validated, $items, $subtotal, $discount, $shipping, $otherFee, $marketplaceFee, $ppn, $pph22, $pph23, $total, $paid, $hppTotal, $request): void {
            $transaction = FinancialTransaction::create([
                'type' => 'sales',
                'number' => $request->string('inv_nomor')->toString() ?: $this->nextTransactionNumber('SLS'),
                'transaction_date' => $validated['tanggal'],
                'cash_account_code' => $validated['akun_kas'] ?? null,
                'main_account_code' => $validated['akun_pendapatan_kode'] ?? null,
                'project_id' => $validated['proyek_id'] ?? null,
                'party_name' => $validated['pelanggan'] ?? 'Walk-in Customer',
                'description' => $validated['keterangan'] ?? null,
                'due_date' => $validated['jatuh_tempo'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'other_fee' => $otherFee,
                'marketplace_fee' => $marketplaceFee,
                'ppn' => $ppn,
                'pph22' => $pph22,
                'pph23' => $pph23,
                'total' => $total,
                'paid_amount' => min($paid, $total),
                'outstanding_amount' => max(0, $total - $paid),
                'hpp_total' => $hppTotal,
                'gross_profit' => $total - $hppTotal,
                'create_invoice' => $request->boolean('buat_invoice'),
                'metadata' => $request->except(['item_nama', 'qty', 'harga', 'hpp', 'diskon_item']),
            ]);

            $transaction->items()->createMany($items);
        });

        return back()->with('success', 'Penjualan berhasil disimpan ke database.');
    }

    private function salesItemsFromRequest(Request $request): array
    {
        $names = $request->input('item_nama', []);
        $quantities = $request->input('qty', []);
        $prices = $request->input('harga', []);
        $costs = $request->input('hpp', []);
        $discounts = $request->input('diskon_item', []);

        return collect($names)
            ->map(function ($name, int $index) use ($quantities, $prices, $costs, $discounts): ?array {
                if (! $name) {
                    return null;
                }

                $quantity = (float) ($quantities[$index] ?? 1);
                $price = (int) ($prices[$index] ?? 0);
                $discount = (int) ($discounts[$index] ?? 0);

                return [
                    'name' => (string) $name,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'unit_cost' => (int) ($costs[$index] ?? 0),
                    'discount' => $discount,
                    'subtotal' => max(0, (int) round($quantity * $price) - $discount),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function nextTransactionNumber(string $prefix): string
    {
        return $prefix.'-'.now()->format('YmdHis');
    }
}
