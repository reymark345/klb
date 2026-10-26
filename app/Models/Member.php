<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'member_code',
        'full_name',
        'email',
        'phone',
        'ministry',
        'life_group',
        'baptism_status',
        'role_type',
        'status',
        'joined_date',
        'notes',
    ];
}

