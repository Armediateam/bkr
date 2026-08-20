<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'month',
        'year',
        'period_label',
        'status',
        'processed_at',
        'note',
        'gross_total',
        'bpjs_total',
        'pph21_total',
        'net_total',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'processed_at' => 'date',
        'gross_total' => 'integer',
        'bpjs_total' => 'integer',
        'pph21_total' => 'integer',
        'net_total' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }
}
