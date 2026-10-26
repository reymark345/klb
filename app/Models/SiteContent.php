<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'key',
        'page',
        'section',
        'label',
        'title',
        'subtitle',
        'body',
        'cta_text',
        'cta_link',
        'image_url',
        'gallery_images',
        'image_alt',
        'focal_point',
        'aspect_ratio',
        'is_published',
        'sort_order',
        'updated_by',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];
}

