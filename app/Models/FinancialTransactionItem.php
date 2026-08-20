<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_transaction_id',
        'name',
        'quantity',
        'unit_price',
        'unit_cost',
        'discount',
        'subtotal',
        'unit',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'integer',
        'unit_cost' => 'integer',
        'discount' => 'integer',
        'subtotal' => 'integer',
        'metadata' => 'array',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }
}
