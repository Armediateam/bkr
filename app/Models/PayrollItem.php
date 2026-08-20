<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'payroll_employee_id',
        'employee_number',
        'employee_name',
        'position',
        'tax_status',
        'npwp',
        'ptkp',
        'base_salary',
        'allowance',
        'meal',
        'transport',
        'bonus',
        'other_income',
        'gross',
        'bpjs_health_employee',
        'bpjs_employment_employee',
        'bpjs_health_company',
        'bpjs_employment_company',
        'pph21',
        'net_pay',
        'note',
    ];

    protected $casts = [
        'ptkp' => 'integer',
        'base_salary' => 'integer',
        'allowance' => 'integer',
        'meal' => 'integer',
        'transport' => 'integer',
        'bonus' => 'integer',
        'other_income' => 'integer',
        'gross' => 'integer',
        'bpjs_health_employee' => 'integer',
        'bpjs_employment_employee' => 'integer',
        'bpjs_health_company' => 'integer',
        'bpjs_employment_company' => 'integer',
        'pph21' => 'integer',
        'net_pay' => 'integer',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class, 'payroll_run_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(PayrollEmployee::class, 'payroll_employee_id');
    }
}
