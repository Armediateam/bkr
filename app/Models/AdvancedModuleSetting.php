<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvancedModuleSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_key',
        'name',
        'active',
        'serial',
        'features',
    ];

    protected $casts = [
        'active' => 'boolean',
        'features' => 'array',
    ];
}
