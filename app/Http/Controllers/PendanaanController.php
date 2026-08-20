<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendanaanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pendanaan', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pendanaan', 'href' => '/dashboard/pendanaan'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'akunHutang' => [
                ['kode' => '2100', 'nama' => 'Hutang Usaha'],
                ['kode' => '2200', 'nama' => 'Hutang Bank / Pinjaman'],
                ['kode' => '2300', 'nama' => 'Hutang Jangka Panjang'],
            ],
            'riwayat' => [
                ['id' => 1, 'tanggal' => now()->subDays(4)->toDateString(), 'keterangan' => 'Tambahan modal kerja', 'pihak' => 'Owner', 'sumber' => 'modal', 'nominal' => 10000000],
                ['id' => 2, 'tanggal' => now()->subDays(12)->toDateString(), 'keterangan' => 'Pinjaman operasional', 'pihak' => 'Bank BRI', 'sumber' => 'hutang', 'nominal' => 25000000],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pendanaan sudah diterima. Penyimpanan jurnal kas, ekuitas, dan hutang akan aktif setelah backend finansial dipindahkan.');
    }
}
