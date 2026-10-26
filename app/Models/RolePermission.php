<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = [
        'role_name',
        'module_key',
        'module_label',
        'module_description',
        'can_view',
        'can_create',
        'can_update',
        'can_delete',
        'can_import',
        'can_export',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_update' => 'boolean',
        'can_delete' => 'boolean',
        'can_import' => 'boolean',
        'can_export' => 'boolean',
    ];
}

