<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackerController extends Controller
{
    public function transactions(Request $request): Response
    {
        $dateFrom = $request->date('from')?->toDateString() ?? now()->startOfMonth()->toDateString();
        $dateTo = $request->date('to')?->toDateString() ?? now()->toDateString();

        return Inertia::render('tracker-transactions', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Daftar Transaksi', 'href' => '/dashboard/daftar-transaksi'],
            ],
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'transactions' => FinancialTransaction::query()
                ->whereBetween('transaction_date', [$dateFrom, $dateTo])
                ->latest('transaction_date')
                ->latest('id')
                ->get()
                ->map(fn (FinancialTransaction $transaction): array => [
                    'id' => $transaction->number,
                    'tanggal' => $transaction->transaction_date->toDateString(),
                    'keterangan' => $transaction->description ?? $transaction->category ?? $this->labelForType($transaction->type),
                    'pihak' => $transaction->party_name,
                    'jenis' => $this->labelForType($transaction->type),
                    'nominal' => $transaction->total,
                    'kas' => $transaction->paid_amount,
                    'labaRugi' => $transaction->type === 'sales' ? $transaction->gross_profit : ($transaction->type === 'expense' ? -1 * $transaction->subtotal : 0),
                    'sisaTagihan' => $transaction->outstanding_amount,
                    'source' => $this->sourceForType($transaction->type),
                ])
                ->all(),
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
            'rows' => FinancialTransaction::query()
                ->where('type', 'sales')
                ->where('total', '>', 0)
                ->latest('transaction_date')
                ->get()
                ->map(fn (FinancialTransaction $transaction): array => [
                    'id' => $transaction->id,
                    'tanggal' => $transaction->transaction_date->toDateString(),
                    'customer' => $transaction->party_name ?? 'Walk-in Customer',
                    'keterangan' => $transaction->description ?? $transaction->number,
                    'jumlah' => $transaction->total,
                    'terbayar' => $transaction->paid_amount,
                    'jatuhTempo' => $transaction->due_date?->toDateString() ?? $transaction->transaction_date->copy()->addDays(30)->toDateString(),
                    'status' => $transaction->outstanding_amount <= 0 ? 'LUNAS' : 'BELUM LUNAS',
                ])
                ->all(),
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
            'rows' => FinancialTransaction::query()
                ->whereIn('type', ['purchase', 'expense'])
                ->where('total', '>', 0)
                ->latest('transaction_date')
                ->get()
                ->map(fn (FinancialTransaction $transaction): array => [
                    'id' => $transaction->id,
                    'tanggal' => $transaction->transaction_date->toDateString(),
                    'vendor' => $transaction->party_name ?? 'Internal',
                    'keterangan' => $transaction->description ?? $transaction->number,
                    'jumlah' => $transaction->total,
                    'terbayar' => $transaction->paid_amount,
                    'jatuhTempo' => $transaction->due_date?->toDateString() ?? $transaction->transaction_date->copy()->addDays(14)->toDateString(),
                    'status' => $transaction->outstanding_amount <= 0 ? 'LUNAS' : 'BELUM LUNAS',
                ])
                ->all(),
        ]);
    }

    public function payReceivable(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:financial_transactions,id'],
            'tanggal' => ['required', 'date'],
            'akun_kas' => ['nullable', 'string', 'max:20'],
            'jumlah' => ['required', 'numeric', 'min:0.01'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = FinancialTransaction::where('type', 'sales')->findOrFail($validated['id']);
        $this->applyPayment($transaction, (int) $validated['jumlah'], [
            'last_receivable_payment_date' => $validated['tanggal'],
            'last_receivable_payment_account' => $validated['akun_kas'] ?? null,
            'last_receivable_payment_note' => $validated['catatan'] ?? null,
        ]);

        return back()->with('success', 'Pembayaran piutang berhasil disimpan.');
    }

    public function writeOffReceivable(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:financial_transactions,id'],
            'tanggal' => ['required', 'date'],
            'jumlah' => ['required', 'numeric', 'min:0.01'],
            'alasan' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = FinancialTransaction::where('type', 'sales')->findOrFail($validated['id']);
        $this->applyPayment($transaction, (int) $validated['jumlah'], [
            'write_off_date' => $validated['tanggal'],
            'write_off_reason' => $validated['alasan'] ?? null,
        ]);

        return back()->with('success', 'Write-off piutang berhasil disimpan.');
    }

    public function payPayable(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:financial_transactions,id'],
            'tanggal' => ['required', 'date'],
            'akun_kas' => ['nullable', 'string', 'max:20'],
            'jumlah' => ['required', 'numeric', 'min:0.01'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = FinancialTransaction::whereIn('type', ['purchase', 'expense'])->findOrFail($validated['id']);
        $this->applyPayment($transaction, (int) $validated['jumlah'], [
            'last_payable_payment_date' => $validated['tanggal'],
            'last_payable_payment_account' => $validated['akun_kas'] ?? null,
            'last_payable_payment_note' => $validated['catatan'] ?? null,
        ]);

        return back()->with('success', 'Pembayaran hutang berhasil disimpan.');
    }

    private function applyPayment(FinancialTransaction $transaction, int $amount, array $metadata): void
    {
        $paidAmount = min($transaction->total, $transaction->paid_amount + $amount);
        $existingMetadata = $transaction->metadata ?? [];

        $transaction->update([
            'paid_amount' => $paidAmount,
            'outstanding_amount' => max(0, $transaction->total - $paidAmount),
            'metadata' => array_merge($existingMetadata, $metadata),
        ]);
    }

    private function labelForType(string $type): string
    {
        return match ($type) {
            'sales' => 'Penjualan',
            'purchase' => 'Pembelian',
            'expense' => 'Pengeluaran',
            default => ucfirst($type),
        };
    }

    private function sourceForType(string $type): string
    {
        return match ($type) {
            'sales' => 'Penjualan',
            'purchase' => 'Pembelian',
            'expense' => 'Pengeluaran',
            default => 'Manual',
        };
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
