<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransferRekeningController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('transfer-rekening', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Transfer Rekening', 'href' => '/dashboard/transfer-rekening'],
            ],
            'today' => now()->toDateString(),
            'rekening' => [
                ['kode' => '1101', 'nama' => 'Kas Utama', 'saldo' => 12500000],
                ['kode' => '1102', 'nama' => 'Bank BCA', 'saldo' => 28750000],
                ['kode' => '1103', 'nama' => 'Bank Mandiri', 'saldo' => 18400000],
            ],
            'riwayat' => [
                ['id' => 1, 'tanggal' => now()->subDays(2)->toDateString(), 'rekeningAsal' => 'Bank BCA', 'rekeningTujuan' => 'Kas Utama', 'nominal' => 2500000, 'biayaAdmin' => 0, 'nomorTx' => 'TRF-001'],
                ['id' => 2, 'tanggal' => now()->subDays(6)->toDateString(), 'rekeningAsal' => 'Kas Utama', 'rekeningTujuan' => 'Bank Mandiri', 'nominal' => 1500000, 'biayaAdmin' => 6500, 'nomorTx' => 'TRF-002'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form transfer rekening sudah diterima. Penyimpanan jurnal transfer dan biaya admin akan aktif setelah backend finansial dipindahkan.');
    }
}
