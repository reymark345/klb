<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
            if (! Schema::hasColumn('users', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('address');
            }
            if (! Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 40)->nullable()->after('birthdate');
            }
            if (! Schema::hasColumn('users', 'ministry')) {
                $table->string('ministry', 120)->nullable()->after('gender');
            }
            if (! Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('ministry');
            }
            if (! Schema::hasColumn('users', 'requested_role')) {
                $table->string('requested_role', 60)->nullable()->after('role');
            }
            if (! Schema::hasColumn('users', 'approved_by')) {
                $table->string('approved_by', 160)->nullable()->after('status');
            }
            if (! Schema::hasColumn('users', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });

        if (! Schema::hasTable('donations')) {
            Schema::create('donations', function (Blueprint $table) {
                $table->id();
                $table->string('donor_name');
                $table->string('email')->nullable();
                $table->string('phone', 60)->nullable();
                $table->decimal('amount', 12, 2)->default(0);
                $table->string('fund_category', 120)->default('Tithes & Offerings');
                $table->string('payment_method', 80)->default('GCash');
                $table->string('reference_number', 100)->nullable();
                $table->text('message')->nullable();
                $table->boolean('is_anonymous')->default(false);
                $table->string('status', 40)->default('Verified');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');

        Schema::table('users', function (Blueprint $table) {
            $cols = ['address', 'birthdate', 'gender', 'ministry', 'bio', 'requested_role', 'approved_by', 'approved_at'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

