<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyReportSubmission extends Model
{
    protected $fillable = [
        'submitted_by',
        'report_id',
        'tanggal',
        'nama_proyek',
        'shift',
        'status',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'payload' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
