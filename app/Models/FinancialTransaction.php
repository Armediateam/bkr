<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'number',
        'transaction_date',
        'cash_account_code',
        'main_account_code',
        'project_id',
        'party_name',
        'category',
        'subcategory',
        'description',
        'supplier_invoice_number',
        'tax_invoice_number',
        'due_date',
        'subtotal',
        'discount',
        'shipping',
        'other_fee',
        'marketplace_fee',
        'ppn',
        'pph22',
        'pph23',
        'total',
        'paid_amount',
        'outstanding_amount',
        'hpp_total',
        'gross_profit',
        'create_invoice',
        'metadata',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'integer',
        'discount' => 'integer',
        'shipping' => 'integer',
        'other_fee' => 'integer',
        'marketplace_fee' => 'integer',
        'ppn' => 'integer',
        'pph22' => 'integer',
        'pph23' => 'integer',
        'total' => 'integer',
        'paid_amount' => 'integer',
        'outstanding_amount' => 'integer',
        'hpp_total' => 'integer',
        'gross_profit' => 'integer',
        'create_invoice' => 'boolean',
        'metadata' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(FinancialTransactionItem::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
