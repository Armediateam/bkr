<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_target_id',
        'account_code',
        'account_name',
        'budget',
        'actual',
    ];

    protected $casts = [
        'budget' => 'integer',
        'actual' => 'integer',
    ];

    public function target(): BelongsTo
    {
        return $this->belongsTo(BudgetTarget::class, 'budget_target_id');
    }
}
