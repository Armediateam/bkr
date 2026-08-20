<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengeluaranController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pengeluaran', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pengeluaran', 'href' => '/dashboard/pengeluaran'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunBeban' => [
                ['kode' => '6100', 'nama' => 'Beban Gaji'],
                ['kode' => '6110', 'nama' => 'Beban Sewa'],
                ['kode' => '6120', 'nama' => 'Beban Listrik & Air'],
                ['kode' => '6140', 'nama' => 'Beban Pemasaran'],
                ['kode' => '6150', 'nama' => 'Beban Administrasi'],
                ['kode' => '6160', 'nama' => 'Beban Bunga'],
                ['kode' => '6180', 'nama' => 'Beban Lainnya'],
            ],
            'akunPajak' => [
                ['kode' => '6170', 'nama' => 'Beban Pajak'],
                ['kode' => '6171', 'nama' => 'PPh Final'],
                ['kode' => '6172', 'nama' => 'PBB'],
            ],
            'akunPrive' => [
                ['kode' => '3300', 'nama' => 'Prive / Penarikan Owner'],
                ['kode' => '3310', 'nama' => 'Penarikan Owner 1'],
                ['kode' => '3320', 'nama' => 'Penarikan Owner 2'],
            ],
            'subkategoriList' => ['Gaji', 'Sewa', 'Utilitas', 'Pemasaran', 'Administrasi', 'Bunga', 'Lainnya'],
            'proyekAktif' => Project::query()
                ->select(['id', 'project_id', 'nama_proyek'])
                ->orderBy('nama_proyek')
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'kode' => $project->project_id,
                    'nama' => $project->nama_proyek,
                ]),
            'vendorList' => ['CV Tirta Pool Supply', 'PT Aqua Teknik', 'Supplier Umum', 'Bengkel Peralatan Kolam'],
            'karyawanList' => ['Ahmad Fauzi', 'Budi Santoso', 'Siti Aminah', 'Rina Marlina'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'akun_kas' => ['nullable', 'string', 'max:20'],
            'akun_beban_kode' => ['nullable', 'string', 'max:20'],
            'akun_pajak_kode' => ['nullable', 'string', 'max:20'],
            'akun_prive_kode' => ['nullable', 'string', 'max:20'],
            'subkategori' => ['nullable', 'string', 'max:80'],
            'karyawan_nama' => ['nullable', 'string', 'max:160'],
            'vendor' => ['nullable', 'string', 'max:160'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'proyek_id' => ['nullable', 'integer', 'exists:projects,id'],
            'nominal' => ['required', 'numeric', 'min:0'],
            'uang_keluar' => ['nullable', 'numeric', 'min:0'],
            'jatuh_tempo' => ['nullable', 'date'],
            'pemasok' => ['nullable', 'string', 'max:160'],
        ]);

        $subtotal = (int) $validated['nominal'];
        $ppn = (int) round($subtotal * (((float) $request->input('ppn_pct', 0)) / 100));
        $pph23 = (int) round($subtotal * (((float) $request->input('pph23_pct', 0)) / 100));
        $total = max(0, $subtotal + $ppn - $pph23);
        $paid = (int) ($validated['uang_keluar'] ?? $total);
        $party = $validated['vendor']
            ?? $validated['pemasok']
            ?? $validated['karyawan_nama']
            ?? 'Internal';

        $transaction = FinancialTransaction::create([
            'type' => 'expense',
            'number' => $this->nextTransactionNumber('EXP'),
            'transaction_date' => $validated['tanggal'],
            'cash_account_code' => $validated['akun_kas'] ?? null,
            'main_account_code' => $validated['akun_beban_kode'] ?? $validated['akun_pajak_kode'] ?? $validated['akun_prive_kode'] ?? null,
            'project_id' => $validated['proyek_id'] ?? null,
            'party_name' => $party,
            'category' => $request->string('kategori')->toString() ?: 'Beban',
            'subcategory' => $validated['subkategori'] ?? null,
            'description' => $validated['keterangan'] ?? null,
            'due_date' => $validated['jatuh_tempo'] ?? null,
            'subtotal' => $subtotal,
            'ppn' => $ppn,
            'pph23' => $pph23,
            'total' => $total,
            'paid_amount' => min($paid, $total),
            'outstanding_amount' => max(0, $total - $paid),
            'metadata' => $request->all(),
        ]);

        $transaction->items()->create([
            'name' => $validated['keterangan'] ?? $validated['subkategori'] ?? 'Pengeluaran',
            'quantity' => 1,
            'unit_price' => $subtotal,
            'unit_cost' => $subtotal,
            'subtotal' => $subtotal,
        ]);

        return back()->with('success', 'Pengeluaran berhasil disimpan ke database.');
    }

    private function nextTransactionNumber(string $prefix): string
    {
        return $prefix.'-'.now()->format('YmdHis');
    }
}
