<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role_name'); // Primary Admin, Admin, Staff/Analyst
            $table->string('module_key'); // cms_visual_media, cms_text_blocks, members_directory, events_sermons, rbac_users, audit_logs, data_import_export
            $table->string('module_label');
            $table->string('module_description')->nullable();
            $table->boolean('can_view')->default(true);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->boolean('can_import')->default(false);
            $table->boolean('can_export')->default(false);
            $table->timestamps();

            $table->unique(['role_name', 'module_key']);
        });

        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('page'); // Landing Page, About Us, Ministries, Sermons & Media, Events & Gatherings, Global / Branding
            $table->string('section');
            $table->string('label');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->text('image_url')->nullable();
            $table->string('image_alt')->nullable();
            $table->string('focal_point')->default('center');
            $table->string('aspect_ratio')->default('16:9');
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('member_code')->unique();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('ministry');
            $table->string('life_group');
            $table->string('baptism_status')->default('Water Baptized');
            $table->string('role_type')->default('Active Member');
            $table->string('status')->default('Active');
            $table->date('joined_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name');
            $table->string('user_role');
            $table->string('action'); // CREATE, UPDATE, DELETE, IMPORT, EXPORT, IMAGE_UPDATE
            $table->string('module');
            $table->string('target_label');
            $table->text('details')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('severity')->default('info'); // info, warning, critical
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('members');
        Schema::dropIfExists('site_contents');
        Schema::dropIfExists('role_permissions');
    }
};

