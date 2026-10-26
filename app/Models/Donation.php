<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'donor_name',
        'email',
        'phone',
        'amount',
        'fund_category',
        'payment_method',
        'reference_number',
        'message',
        'is_anonymous',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'is_anonymous' => 'boolean',
        ];
    }
}

