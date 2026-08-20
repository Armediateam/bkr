<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PelunasanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pelunasan', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Pelunasan', 'href' => '/dashboard/pelunasan'],
            ],
            'today' => now()->toDateString(),
            'akunKas' => [
                ['kode' => '1101', 'nama' => 'Kas Utama'],
                ['kode' => '1102', 'nama' => 'Bank BCA'],
                ['kode' => '1103', 'nama' => 'Bank Mandiri'],
            ],
            'piutangAktif' => [
                ['id' => 1, 'nama' => 'Villa Samudra Management', 'keterangan' => 'Invoice INV-001', 'sisa' => 4500000, 'jatuhTempo' => now()->addDays(7)->toDateString()],
                ['id' => 2, 'nama' => 'Blue Lagoon Hospitality', 'keterangan' => 'Invoice INV-002', 'sisa' => 2800000, 'jatuhTempo' => now()->addDays(14)->toDateString()],
            ],
            'hutangAktif' => [
                ['id' => 1, 'nama' => 'CV Tirta Pool Supply', 'keterangan' => 'Pembelian PO-001', 'sisa' => 3250000, 'jatuhTempo' => now()->addDays(5)->toDateString()],
                ['id' => 2, 'nama' => 'PT Aqua Teknik', 'keterangan' => 'Pembelian PO-002', 'sisa' => 1900000, 'jatuhTempo' => now()->addDays(10)->toDateString()],
            ],
            'pinjamanAktif' => [
                ['id' => 'Ahmad Fauzi', 'nama' => 'Ahmad Fauzi', 'keterangan' => 'Piutang Karyawan 1160', 'sisa' => 750000, 'jatuhTempo' => null],
                ['id' => 'Budi Santoso', 'nama' => 'Budi Santoso', 'keterangan' => 'Piutang Karyawan 1160', 'sisa' => 500000, 'jatuhTempo' => null],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('success', 'Form pelunasan sudah diterima. Penyimpanan jurnal, kas, piutang, hutang, dan pinjaman karyawan akan aktif setelah backend finansial dipindahkan.');
    }
}
