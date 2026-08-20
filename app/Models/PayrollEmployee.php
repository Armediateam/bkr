<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollEmployee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_number',
        'name',
        'position',
        'employment_status',
        'tax_status',
        'npwp',
        'base_salary',
        'allowance',
        'daily_rate',
        'dependents',
        'bpjs_health_enabled',
        'bpjs_employment_enabled',
        'active',
    ];

    protected $casts = [
        'base_salary' => 'integer',
        'allowance' => 'integer',
        'daily_rate' => 'integer',
        'dependents' => 'integer',
        'bpjs_health_enabled' => 'boolean',
        'bpjs_employment_enabled' => 'boolean',
        'active' => 'boolean',
    ];

    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }
}
