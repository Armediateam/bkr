<?php

namespace App\Http\Controllers;

use App\Models\AdvancedModuleSetting;
use App\Models\BudgetLine;
use App\Models\BudgetTarget;
use App\Models\PayrollEmployee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdvancedModuleController extends Controller
{
    public function employees(): Response
    {
        return Inertia::render('payroll-employees', [
            'employees' => PayrollEmployee::query()
                ->orderByDesc('active')
                ->orderBy('employee_number')
                ->get()
                ->map(fn (PayrollEmployee $employee): array => $this->mapEmployee($employee))
                ->all(),
            'ptkpReferences' => $this->ptkpReferences(),
        ]);
    }

    public function storeEmployee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employeeNumber' => ['nullable', 'string', 'max:40', 'unique:payroll_employees,employee_number'],
            'name' => ['required', 'string', 'max:120'],
            'position' => ['nullable', 'string', 'max:120'],
            'employmentStatus' => ['required', 'in:TETAP,KONTRAK,HARIAN'],
            'taxStatus' => ['required', 'string', 'max:10'],
            'npwp' => ['nullable', 'string', 'max:40'],
            'baseSalary' => ['required', 'numeric', 'min:0'],
            'allowance' => ['nullable', 'numeric', 'min:0'],
            'bpjsHealth' => ['boolean'],
            'bpjsEmployment' => ['boolean'],
        ]);

        PayrollEmployee::create([
            'employee_number' => $validated['employeeNumber'] ?: $this->nextEmployeeNumber(),
            'name' => $validated['name'],
            'position' => $validated['position'] ?? null,
            'employment_status' => $validated['employmentStatus'],
            'tax_status' => $validated['taxStatus'],
            'npwp' => $validated['npwp'] ?? null,
            'base_salary' => (int) $validated['baseSalary'],
            'allowance' => (int) ($validated['allowance'] ?? 0),
            'bpjs_health_enabled' => (bool) ($validated['bpjsHealth'] ?? false),
            'bpjs_employment_enabled' => (bool) ($validated['bpjsEmployment'] ?? false),
            'active' => true,
        ]);

        return back()->with('success', 'Data karyawan berhasil disimpan.');
    }

    public function payrollProcess(): Response
    {
        $employees = PayrollEmployee::query()
            ->where('active', true)
            ->orderBy('employee_number')
            ->get();

        $rows = $employees
            ->map(fn (PayrollEmployee $employee): array => $this->previewPayrollRow($employee))
            ->all();

        return Inertia::render('payroll-process', [
            'period' => [
                'month' => $this->monthName((int) now()->month),
                'year' => (int) now()->year,
            ],
            'payrollRows' => $rows,
            'summary' => $this->payrollSummary($rows),
        ]);
    }

    public function storePayrollProcess(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'string', 'max:20'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'note' => ['nullable', 'string', 'max:255'],
            'meal' => ['nullable', 'numeric', 'min:0'],
            'transport' => ['nullable', 'numeric', 'min:0'],
            'bonus' => ['nullable', 'numeric', 'min:0'],
            'other' => ['nullable', 'numeric', 'min:0'],
        ]);

        $month = $this->monthNumber($validated['month']);
        $year = (int) $validated['year'];
        $periodLabel = $this->monthName($month).' '.$year;
        $employees = PayrollEmployee::query()
            ->where('active', true)
            ->orderBy('employee_number')
            ->get();

        if ($employees->isEmpty()) {
            return back()->with('error', 'Belum ada karyawan aktif untuk diproses.');
        }

        DB::transaction(function () use ($employees, $month, $year, $periodLabel, $validated): void {
            $run = PayrollRun::updateOrCreate(
                ['month' => $month, 'year' => $year],
                [
                    'period_label' => $periodLabel,
                    'status' => 'Siap Bayar',
                    'processed_at' => Carbon::today(),
                    'note' => $validated['note'] ?? null,
                ],
            );

            $run->items()->delete();

            foreach ($employees as $employee) {
                $row = $this->buildPayrollItemData($employee, [
                    'meal' => (int) ($validated['meal'] ?? 0),
                    'transport' => (int) ($validated['transport'] ?? 0),
                    'bonus' => (int) ($validated['bonus'] ?? 0),
                    'other_income' => (int) ($validated['other'] ?? 0),
                    'note' => $validated['note'] ?? null,
                ]);

                $run->items()->create($row);
            }

            $items = $run->items()->get();

            $run->forceFill([
                'gross_total' => $items->sum('gross'),
                'bpjs_total' => $items->sum(fn (PayrollItem $item): int => $item->bpjs_health_employee + $item->bpjs_employment_employee),
                'pph21_total' => $items->sum('pph21'),
                'net_total' => $items->sum('net_pay'),
            ])->save();
        });

        return redirect()->route('payroll.history')->with('success', 'Proses gaji berhasil disimpan.');
    }

    public function payrollHistory(): Response
    {
        return Inertia::render('payroll-history', [
            'periods' => PayrollRun::query()
                ->with('items')
                ->orderByDesc('year')
                ->orderByDesc('month')
                ->get()
                ->map(function (PayrollRun $run): array {
                    return [
                        'period' => $run->period_label,
                        'processedAt' => $run->processed_at?->toDateString() ?? $run->created_at->toDateString(),
                        'status' => $run->status,
                        'employeeCount' => $run->items->count(),
                        'gross' => $run->gross_total,
                        'bpjs' => $run->bpjs_total,
                        'pph21' => $run->pph21_total,
                        'netPay' => $run->net_total,
                        'rows' => $run->items->map(fn (PayrollItem $item): array => [
                            'id' => (string) $item->id,
                            'employeeNumber' => $item->employee_number,
                            'name' => $item->employee_name,
                            'gross' => $item->gross,
                            'bpjs' => $item->bpjs_health_employee + $item->bpjs_employment_employee,
                            'pph21' => $item->pph21,
                            'netPay' => $item->net_pay,
                        ])->all(),
                    ];
                })
                ->all(),
        ]);
    }

    public function payrollSlip(PayrollItem $id): Response
    {
        $id->load('run');

        return Inertia::render('payroll-slip', [
            'company' => [
                'name' => config('app.name', 'Bisnis Kolam Renang'),
                'address' => 'Alamat perusahaan dapat diatur dari menu pengaturan.',
            ],
            'slip' => [
                'id' => (string) $id->id,
                'period' => $id->run?->period_label ?? '-',
                'employeeNumber' => $id->employee_number,
                'employeeName' => $id->employee_name,
                'position' => $id->position ?? '-',
                'taxStatus' => $id->tax_status,
                'ptkp' => $id->ptkp,
                'npwp' => $id->npwp ?? '-',
                'baseSalary' => $id->base_salary,
                'allowance' => $id->allowance,
                'meal' => $id->meal,
                'transport' => $id->transport,
                'bonus' => $id->bonus,
                'otherIncome' => $id->other_income,
                'gross' => $id->gross,
                'bpjsHealthEmployee' => $id->bpjs_health_employee,
                'bpjsEmploymentEmployee' => $id->bpjs_employment_employee,
                'pph21' => $id->pph21,
                'netPay' => $id->net_pay,
                'bpjsHealthCompany' => $id->bpjs_health_company,
                'bpjsEmploymentCompany' => $id->bpjs_employment_company,
                'note' => $id->note ?? '',
            ],
        ]);
    }

    public function budget(Request $request): Response
    {
        $month = $this->monthNumber($request->string('month', $this->monthName((int) now()->month))->toString());
        $year = (int) $request->integer('year', (int) now()->year);
        $target = BudgetTarget::firstOrCreate(
            ['month' => $month, 'year' => $year],
            ['target_revenue' => 0, 'actual_revenue' => 0],
        );

        $target->load('lines');

        return Inertia::render('budget-target', [
            'period' => ['month' => $this->monthName($month), 'year' => $year],
            'targetRevenue' => $target->target_revenue,
            'actualRevenue' => $target->actual_revenue,
            'budgetRows' => $target->lines
                ->sortBy('account_code')
                ->map(fn (BudgetLine $line): array => [
                    'accountCode' => $line->account_code,
                    'accountName' => $line->account_name,
                    'budget' => $line->budget,
                    'actual' => $line->actual,
                ])
                ->values()
                ->all(),
            'expenseAccounts' => $this->expenseAccounts(),
        ]);
    }

    public function storeBudget(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'string', 'max:20'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'accountCode' => ['nullable', 'string', 'max:20'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'targetRevenue' => ['nullable', 'numeric', 'min:0'],
        ]);

        $month = $this->monthNumber($validated['month']);
        $target = BudgetTarget::firstOrCreate(
            ['month' => $month, 'year' => (int) $validated['year']],
            ['target_revenue' => 0, 'actual_revenue' => 0],
        );

        if (array_key_exists('targetRevenue', $validated) && $validated['targetRevenue'] !== null) {
            $target->update(['target_revenue' => (int) $validated['targetRevenue']]);
        }

        if (! empty($validated['accountCode']) && $validated['amount'] !== null && $validated['amount'] !== '') {
            $account = collect($this->expenseAccounts())->firstWhere('code', $validated['accountCode']);

            $target->lines()->updateOrCreate(
                ['account_code' => $validated['accountCode']],
                [
                    'account_name' => $account['name'] ?? 'Akun Beban '.$validated['accountCode'],
                    'budget' => (int) $validated['amount'],
                ],
            );
        }

        return back()->with('success', 'Anggaran berhasil disimpan.');
    }

    public function moduleSettings(): Response
    {
        $this->ensureDefaultModules();

        return Inertia::render('module-settings', [
            'modules' => AdvancedModuleSetting::query()
                ->orderBy('id')
                ->get()
                ->map(fn (AdvancedModuleSetting $module): array => [
                    'key' => $module->module_key,
                    'name' => $module->name,
                    'active' => $module->active,
                    'serial' => $module->serial ?? '',
                    'features' => $module->features ?? [],
                ])
                ->all(),
        ]);
    }

    public function storeModuleSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'moduleKey' => ['required', 'string', 'max:80', 'exists:advanced_module_settings,module_key'],
            'serial' => ['nullable', 'string', 'max:80'],
            'active' => ['nullable', 'boolean'],
        ]);

        AdvancedModuleSetting::where('module_key', $validated['moduleKey'])->update([
            'serial' => $validated['serial'] ?? null,
            'active' => (bool) ($validated['active'] ?? true),
        ]);

        return back()->with('success', 'Status modul berhasil diperbarui.');
    }

    private function mapEmployee(PayrollEmployee $employee): array
    {
        $bpjsHealth = $employee->bpjs_health_enabled ? (int) round($employee->base_salary * 0.01) : 0;
        $bpjsEmployment = $employee->bpjs_employment_enabled ? (int) round($employee->base_salary * 0.03) : 0;

        return [
            'employeeNumber' => $employee->employee_number,
            'name' => $employee->name,
            'position' => $employee->position ?? '-',
            'employmentStatus' => $employee->employment_status,
            'taxStatus' => $employee->tax_status,
            'npwp' => $employee->npwp ?? '-',
            'baseSalary' => $employee->base_salary,
            'allowance' => $employee->allowance,
            'bpjsHealth' => $bpjsHealth,
            'bpjsEmployment' => $bpjsEmployment,
            'pph21' => $this->calculatePph21($employee->base_salary + $employee->allowance, $employee->tax_status),
            'active' => $employee->active,
        ];
    }

    private function previewPayrollRow(PayrollEmployee $employee): array
    {
        $item = $this->buildPayrollItemData($employee, [
            'meal' => 0,
            'transport' => 0,
            'bonus' => 0,
            'other_income' => 0,
            'note' => null,
        ]);

        return [
            'employeeNumber' => $item['employee_number'],
            'name' => $item['employee_name'],
            'position' => $item['position'] ?? '-',
            'baseSalary' => $item['base_salary'],
            'allowance' => $item['allowance'],
            'meal' => $item['meal'],
            'transport' => $item['transport'],
            'bonus' => $item['bonus'],
            'bpjs' => $item['bpjs_health_employee'] + $item['bpjs_employment_employee'],
            'pph21' => $item['pph21'],
            'netPay' => $item['net_pay'],
        ];
    }

    private function buildPayrollItemData(PayrollEmployee $employee, array $variables): array
    {
        $baseSalary = $employee->employment_status === 'HARIAN' && $employee->base_salary === 0
            ? $employee->daily_rate
            : $employee->base_salary;
        $allowance = $employee->allowance;
        $meal = (int) $variables['meal'];
        $transport = (int) $variables['transport'];
        $bonus = (int) $variables['bonus'];
        $otherIncome = (int) $variables['other_income'];
        $gross = $baseSalary + $allowance + $meal + $transport + $bonus + $otherIncome;
        $bpjsHealthEmployee = $employee->bpjs_health_enabled ? (int) round($baseSalary * 0.01) : 0;
        $bpjsEmploymentEmployee = $employee->bpjs_employment_enabled ? (int) round($baseSalary * 0.03) : 0;
        $bpjsHealthCompany = $employee->bpjs_health_enabled ? (int) round($baseSalary * 0.04) : 0;
        $bpjsEmploymentCompany = $employee->bpjs_employment_enabled ? (int) round($baseSalary * 0.057) : 0;
        $pph21 = $this->calculatePph21($gross, $employee->tax_status);
        $netPay = max(0, $gross - $bpjsHealthEmployee - $bpjsEmploymentEmployee - $pph21);

        return [
            'payroll_employee_id' => $employee->id,
            'employee_number' => $employee->employee_number,
            'employee_name' => $employee->name,
            'position' => $employee->position,
            'tax_status' => $employee->tax_status,
            'npwp' => $employee->npwp,
            'ptkp' => $this->ptkpAmount($employee->tax_status),
            'base_salary' => $baseSalary,
            'allowance' => $allowance,
            'meal' => $meal,
            'transport' => $transport,
            'bonus' => $bonus,
            'other_income' => $otherIncome,
            'gross' => $gross,
            'bpjs_health_employee' => $bpjsHealthEmployee,
            'bpjs_employment_employee' => $bpjsEmploymentEmployee,
            'bpjs_health_company' => $bpjsHealthCompany,
            'bpjs_employment_company' => $bpjsEmploymentCompany,
            'pph21' => $pph21,
            'net_pay' => $netPay,
            'note' => $variables['note'],
        ];
    }

    private function payrollSummary(array $rows): array
    {
        return [
            'gross' => collect($rows)->sum(fn (array $row): int => $row['baseSalary'] + $row['allowance'] + $row['meal'] + $row['transport'] + $row['bonus']),
            'bpjs' => collect($rows)->sum('bpjs'),
            'pph21' => collect($rows)->sum('pph21'),
            'netPay' => collect($rows)->sum('netPay'),
        ];
    }

    private function calculatePph21(int $monthlyGross, string $taxStatus): int
    {
        $taxableAnnual = max(0, ($monthlyGross * 12) - $this->ptkpAmount($taxStatus));
        $remaining = $taxableAnnual;
        $annualTax = 0;
        $tiers = [
            [60000000, 0.05],
            [190000000, 0.15],
            [250000000, 0.25],
            [4500000000, 0.30],
        ];

        foreach ($tiers as [$limit, $rate]) {
            if ($remaining <= 0) {
                break;
            }

            $taxed = min($remaining, $limit);
            $annualTax += $taxed * $rate;
            $remaining -= $taxed;
        }

        if ($remaining > 0) {
            $annualTax += $remaining * 0.35;
        }

        return (int) round($annualTax / 12);
    }

    private function nextEmployeeNumber(): string
    {
        $next = ((int) PayrollEmployee::query()->max('id')) + 1;

        return 'BKR-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    private function ptkpReferences(): array
    {
        return [
            ['code' => 'TK0', 'label' => 'Tidak Kawin, 0 tanggungan', 'amount' => 54000000],
            ['code' => 'K0', 'label' => 'Kawin, 0 tanggungan', 'amount' => 58500000],
            ['code' => 'K1', 'label' => 'Kawin, 1 tanggungan', 'amount' => 63000000],
            ['code' => 'K2', 'label' => 'Kawin, 2 tanggungan', 'amount' => 67500000],
            ['code' => 'K3', 'label' => 'Kawin, 3 tanggungan', 'amount' => 72000000],
        ];
    }

    private function ptkpAmount(string $taxStatus): int
    {
        return collect($this->ptkpReferences())->firstWhere('code', $taxStatus)['amount'] ?? 54000000;
    }

    private function monthNumber(string $month): int
    {
        $months = array_flip($this->monthNames());

        return $months[$month] ?? max(1, min(12, (int) $month));
    }

    private function monthName(int $month): string
    {
        return $this->monthNames()[$month] ?? 'Januari';
    }

    private function monthNames(): array
    {
        return [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];
    }

    private function expenseAccounts(): array
    {
        return [
            ['code' => '6100', 'name' => 'Beban Gaji'],
            ['code' => '6200', 'name' => 'Beban Operasional Kolam'],
            ['code' => '6300', 'name' => 'Beban Marketing'],
            ['code' => '6400', 'name' => 'Beban Administrasi'],
        ];
    }

    private function ensureDefaultModules(): void
    {
        foreach ($this->defaultModules() as $module) {
            AdvancedModuleSetting::firstOrCreate(
                ['module_key' => $module['module_key']],
                $module,
            );
        }
    }

    private function defaultModules(): array
    {
        return [
            ['module_key' => 'tax_payroll', 'name' => 'Pajak & Gaji', 'active' => true, 'serial' => 'BKR-TAX-2026', 'features' => ['Hub Pajak dan SPT Masa PPN', 'Master karyawan dan proses payroll', 'Kalkulasi BPJS, PPh 21, dan slip gaji']],
            ['module_key' => 'budget', 'name' => 'Anggaran & Target', 'active' => true, 'serial' => 'BKR-BGT-2026', 'features' => ['Target pendapatan bulanan', 'Anggaran beban per akun', 'Indikator realisasi dan over-budget']],
            ['module_key' => 'production', 'name' => 'Produksi & HPP', 'active' => true, 'serial' => 'BKR-HPP-2026', 'features' => ['Bill of material produksi', 'Kalkulasi HPP otomatis', 'Posting stok dan jurnal']],
            ['module_key' => 'pos', 'name' => 'POS Kasir', 'active' => true, 'serial' => 'BKR-POS-2026', 'features' => ['Transaksi kasir cepat', 'Master item POS', 'Sinkronisasi penjualan dan stok']],
        ];
    }
}
