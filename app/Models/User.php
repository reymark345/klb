<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'requested_role',
        'department',
        'phone',
        'address',
        'birthdate',
        'gender',
        'ministry',
        'bio',
        'status',
        'approved_by',
        'approved_at',
        'avatar_url',
        'custom_permissions',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'approved_at' => 'datetime',
            'birthdate' => 'date:Y-m-d',
            'password' => 'hashed',
            'custom_permissions' => 'array',
        ];
    }

    public function isAdminRole(): bool
    {
        return $this->status === 'Active' && in_array($this->role, ['Primary Admin', 'Admin'], true);
    }

    public function canEditContentAndImages(): bool
    {
        if ($this->status !== 'Active') {
            return false;
        }

        return in_array($this->role, ['Primary Admin', 'Admin', 'Content Creator'], true);
    }

    public function resolvedPermissions(): array
    {
        try {
            if ($this->status !== 'Active') {
                return [];
            }

            $rows = RolePermission::where('role_name', $this->role)->get();
            $map = [];
            foreach ($rows as $row) {
                $map[$row->module_key] = [
                    'can_view' => (bool) $row->can_view,
                    'can_create' => (bool) $row->can_create,
                    'can_update' => (bool) $row->can_update,
                    'can_delete' => (bool) $row->can_delete,
                    'can_import' => (bool) $row->can_import,
                    'can_export' => (bool) $row->can_export,
                ];
            }

            if (is_array($this->custom_permissions)) {
                foreach ($this->custom_permissions as $mod => $overrides) {
                    if (isset($map[$mod]) && is_array($overrides)) {
                        $map[$mod] = array_merge($map[$mod], $overrides);
                    }
                }
            }

            return $map;
        } catch (\Throwable $e) {
            return [];
        }
    }
}
