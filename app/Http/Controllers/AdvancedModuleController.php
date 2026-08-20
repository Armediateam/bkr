<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdvancedModuleController extends Controller
{
    public function employees(): Response
    {
        return Inertia::render('payroll-employees', [
            'employees' => $this->employeesData(),
            'ptkpReferences' => [
                ['code' => 'TK0', 'label' => 'Tidak Kawin, 0 tanggungan', 'amount' => 54000000],
                ['code' => 'K0', 'label' => 'Kawin, 0 tanggungan', 'amount' => 58500000],
                ['code' => 'K1', 'label' => 'Kawin, 1 tanggungan', 'amount' => 63000000],
                ['code' => 'K2', 'label' => 'Kawin, 2 tanggungan', 'amount' => 67500000],
                ['code' => 'K3', 'label' => 'Kawin, 3 tanggungan', 'amount' => 72000000],
            ],
        ]);
    }

    public function storeEmployee(Request $request): RedirectResponse
    {
        $request->validate([
            'employeeNumber' => ['nullable', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:120'],
            'position' => ['nullable', 'string', 'max:120'],
            'baseSalary' => ['required', 'numeric', 'min:0'],
        ]);

        return back()->with('success', 'Data karyawan disiapkan untuk disimpan.');
    }

    public function payrollProcess(): Response
    {
        $employees = $this->employeesData();
        $rows = collect($employees)->map(function (array $employee): array {
            $gross = $employee['baseSalary'] + $employee['allowance'] + $employee['meal'] + $employee['transport'];
            $bpjs = $employee['bpjsHealth'] + $employee['bpjsEmployment'];
            $deduction = $bpjs + $employee['pph21'];

            return [
                'employeeNumber' => $employee['employeeNumber'],
                'name' => $employee['name'],
                'position' => $employee['position'],
                'baseSalary' => $employee['baseSalary'],
                'allowance' => $employee['allowance'],
                'meal' => $employee['meal'],
                'transport' => $employee['transport'],
                'bonus' => 0,
                'bpjs' => $bpjs,
                'pph21' => $employee['pph21'],
                'netPay' => $gross - $deduction,
            ];
        })->values()->all();

        return Inertia::render('payroll-process', [
            'period' => ['month' => 'Agustus', 'year' => 2026],
            'payrollRows' => $rows,
            'summary' => [
                'gross' => collect($rows)->sum(fn (array $row): int => $row['baseSalary'] + $row['allowance'] + $row['meal'] + $row['transport'] + $row['bonus']),
                'bpjs' => collect($rows)->sum('bpjs'),
                'pph21' => collect($rows)->sum('pph21'),
                'netPay' => collect($rows)->sum('netPay'),
            ],
        ]);
    }

    public function storePayrollProcess(Request $request): RedirectResponse
    {
        $request->validate([
            'month' => ['required', 'string', 'max:20'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        return back()->with('success', 'Proses gaji disiapkan untuk dicatat ke jurnal.');
    }

    public function payrollHistory(): Response
    {
        return Inertia::render('payroll-history', [
            'periods' => [
                [
                    'period' => 'Agustus 2026',
                    'processedAt' => '2026-08-25',
                    'status' => 'Siap Bayar',
                    'employeeCount' => 8,
                    'gross' => 59450000,
                    'bpjs' => 2860000,
                    'pph21' => 1095000,
                    'netPay' => 55495000,
                    'rows' => [
                        ['id' => 'PAY-0826-001', 'employeeNumber' => 'BKR-001', 'name' => 'Budi Santoso', 'gross' => 8050000, 'bpjs' => 390000, 'pph21' => 185000, 'netPay' => 7475000],
                        ['id' => 'PAY-0826-002', 'employeeNumber' => 'BKR-002', 'name' => 'Sari Wijaya', 'gross' => 7200000, 'bpjs' => 345000, 'pph21' => 150000, 'netPay' => 6705000],
                        ['id' => 'PAY-0826-003', 'employeeNumber' => 'BKR-003', 'name' => 'Rizky Pratama', 'gross' => 6800000, 'bpjs' => 320000, 'pph21' => 115000, 'netPay' => 6365000],
                    ],
                ],
                [
                    'period' => 'Juli 2026',
                    'processedAt' => '2026-07-25',
                    'status' => 'Terbayar',
                    'employeeCount' => 8,
                    'gross' => 58200000,
                    'bpjs' => 2800000,
                    'pph21' => 1030000,
                    'netPay' => 54370000,
                    'rows' => [
                        ['id' => 'PAY-0726-001', 'employeeNumber' => 'BKR-001', 'name' => 'Budi Santoso', 'gross' => 7900000, 'bpjs' => 390000, 'pph21' => 180000, 'netPay' => 7330000],
                        ['id' => 'PAY-0726-002', 'employeeNumber' => 'BKR-002', 'name' => 'Sari Wijaya', 'gross' => 7100000, 'bpjs' => 345000, 'pph21' => 145000, 'netPay' => 6610000],
                    ],
                ],
            ],
        ]);
    }

    public function payrollSlip(string $id): Response
    {
        return Inertia::render('payroll-slip', [
            'company' => [
                'name' => 'Bisnis Kolam Renang',
                'address' => 'Jl. Operasional Kolam No. 18, Jakarta',
            ],
            'slip' => [
                'id' => $id,
                'period' => 'Agustus 2026',
                'employeeNumber' => 'BKR-001',
                'employeeName' => 'Budi Santoso',
                'position' => 'Teknisi Senior',
                'taxStatus' => 'K1',
                'ptkp' => 63000000,
                'npwp' => '09.123.456.7-012.000',
                'baseSalary' => 6500000,
                'allowance' => 750000,
                'meal' => 500000,
                'transport' => 300000,
                'bonus' => 0,
                'otherIncome' => 0,
                'gross' => 8050000,
                'bpjsHealthEmployee' => 260000,
                'bpjsEmploymentEmployee' => 130000,
                'pph21' => 185000,
                'netPay' => 7475000,
                'bpjsHealthCompany' => 1040000,
                'bpjsEmploymentCompany' => 370500,
                'note' => 'Payroll periode Agustus 2026 siap dibayarkan.',
            ],
        ]);
    }

    public function budget(): Response
    {
        $rows = [
            ['accountCode' => '6100', 'accountName' => 'Beban Gaji', 'budget' => 60000000, 'actual' => 55495000],
            ['accountCode' => '6200', 'accountName' => 'Beban Operasional Kolam', 'budget' => 22000000, 'actual' => 18450000],
            ['accountCode' => '6300', 'accountName' => 'Beban Marketing', 'budget' => 12000000, 'actual' => 13600000],
            ['accountCode' => '6400', 'accountName' => 'Beban Administrasi', 'budget' => 8500000, 'actual' => 5200000],
        ];

        return Inertia::render('budget-target', [
            'period' => ['month' => 'Agustus', 'year' => 2026],
            'targetRevenue' => 185000000,
            'actualRevenue' => 142750000,
            'budgetRows' => $rows,
            'expenseAccounts' => [
                ['code' => '6100', 'name' => 'Beban Gaji'],
                ['code' => '6200', 'name' => 'Beban Operasional Kolam'],
                ['code' => '6300', 'name' => 'Beban Marketing'],
                ['code' => '6400', 'name' => 'Beban Administrasi'],
            ],
        ]);
    }

    public function storeBudget(Request $request): RedirectResponse
    {
        $request->validate([
            'accountCode' => ['nullable', 'string', 'max:20'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'targetRevenue' => ['nullable', 'numeric', 'min:0'],
        ]);

        return back()->with('success', 'Anggaran disiapkan untuk disimpan.');
    }

    public function moduleSettings(): Response
    {
        return Inertia::render('module-settings', [
            'modules' => [
                ['key' => 'tax_payroll', 'name' => 'Pajak & Gaji', 'active' => true, 'serial' => 'BKR-TAX-2026', 'features' => ['Hub Pajak dan SPT Masa PPN', 'Master karyawan dan proses payroll', 'Kalkulasi BPJS, PPh 21, dan slip gaji']],
                ['key' => 'budget', 'name' => 'Anggaran & Target', 'active' => true, 'serial' => 'BKR-BGT-2026', 'features' => ['Target pendapatan bulanan', 'Anggaran beban per akun', 'Indikator realisasi dan over-budget']],
                ['key' => 'production', 'name' => 'Produksi & HPP', 'active' => true, 'serial' => 'BKR-HPP-2026', 'features' => ['Bill of material produksi', 'Kalkulasi HPP otomatis', 'Posting stok dan jurnal']],
                ['key' => 'pos', 'name' => 'POS Kasir', 'active' => true, 'serial' => 'BKR-POS-2026', 'features' => ['Transaksi kasir cepat', 'Master item POS', 'Sinkronisasi penjualan dan stok']],
            ],
        ]);
    }

    public function storeModuleSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'moduleKey' => ['required', 'string', 'max:80'],
            'serial' => ['nullable', 'string', 'max:80'],
        ]);

        return back()->with('success', 'Status modul disiapkan untuk diperbarui.');
    }

    private function employeesData(): array
    {
        return [
            ['employeeNumber' => 'BKR-001', 'name' => 'Budi Santoso', 'position' => 'Teknisi Senior', 'employmentStatus' => 'TETAP', 'taxStatus' => 'K1', 'npwp' => '09.123.456.7-012.000', 'baseSalary' => 6500000, 'allowance' => 750000, 'meal' => 500000, 'transport' => 300000, 'bpjsHealth' => 260000, 'bpjsEmployment' => 130000, 'pph21' => 185000, 'active' => true],
            ['employeeNumber' => 'BKR-002', 'name' => 'Sari Wijaya', 'position' => 'Admin Finance', 'employmentStatus' => 'TETAP', 'taxStatus' => 'TK0', 'npwp' => '08.987.654.3-012.000', 'baseSalary' => 5800000, 'allowance' => 600000, 'meal' => 500000, 'transport' => 300000, 'bpjsHealth' => 232000, 'bpjsEmployment' => 113000, 'pph21' => 150000, 'active' => true],
            ['employeeNumber' => 'BKR-003', 'name' => 'Rizky Pratama', 'position' => 'Sales Proyek', 'employmentStatus' => 'KONTRAK', 'taxStatus' => 'TK0', 'npwp' => '-', 'baseSalary' => 5200000, 'allowance' => 800000, 'meal' => 500000, 'transport' => 300000, 'bpjsHealth' => 208000, 'bpjsEmployment' => 112000, 'pph21' => 115000, 'active' => true],
            ['employeeNumber' => 'BKR-004', 'name' => 'Dian Lestari', 'position' => 'Kasir POS', 'employmentStatus' => 'HARIAN', 'taxStatus' => 'TK0', 'npwp' => '-', 'baseSalary' => 0, 'allowance' => 0, 'meal' => 450000, 'transport' => 250000, 'bpjsHealth' => 0, 'bpjsEmployment' => 0, 'pph21' => 0, 'active' => true],
        ];
    }
}
