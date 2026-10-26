<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action',
        'module',
        'target_label',
        'details',
        'old_values',
        'new_values',
        'ip_address',
        'severity',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public static function record(
        ?Request $request,
        string $action,
        string $module,
        string $targetLabel,
        string $details,
        ?array $oldValues = null,
        ?array $newValues = null,
        string $severity = 'info'
    ): self {
        $user = $request?->user();

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'System / Pastor Joshua Valdehueza',
            'user_role' => $user?->role ?? 'Primary Admin',
            'action' => strtoupper($action),
            'module' => $module,
            'target_label' => $targetLabel,
            'details' => $details,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip() ?? '127.0.0.1',
            'severity' => $severity,
        ]);
    }
}

