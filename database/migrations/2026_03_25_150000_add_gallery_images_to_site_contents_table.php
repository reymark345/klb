<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('site_contents') && ! Schema::hasColumn('site_contents', 'gallery_images')) {
            Schema::table('site_contents', function (Blueprint $table) {
                $table->json('gallery_images')->nullable()->after('image_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('site_contents') && Schema::hasColumn('site_contents', 'gallery_images')) {
            Schema::table('site_contents', function (Blueprint $table) {
                $table->dropColumn('gallery_images');
            });
        }
    }
};

