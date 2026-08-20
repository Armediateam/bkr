<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'month',
        'year',
        'target_revenue',
        'actual_revenue',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'target_revenue' => 'integer',
        'actual_revenue' => 'integer',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(BudgetLine::class);
    }
}
