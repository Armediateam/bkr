<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'project_id',
        'nama_proyek',
        'lokasi',
        'client',
        'product_manager',
        'target_selesai',
        'progress',
        'status',
        'nilai_kontrak',
    ];

    protected function casts(): array
    {
        return [
            'target_selesai' => 'date',
            'progress' => 'integer',
        ];
    }
}
