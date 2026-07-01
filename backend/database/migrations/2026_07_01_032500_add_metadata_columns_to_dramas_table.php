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
        Schema::table('dramas', function (Blueprint $table) {
            if (!Schema::hasColumn('dramas', 'year')) {
                $table->string('year', 10)->nullable()->default('2025');
            }
            if (!Schema::hasColumn('dramas', 'rating')) {
                $table->string('rating', 10)->nullable()->default('8.0');
            }
            if (!Schema::hasColumn('dramas', 'views')) {
                $table->integer('views')->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dramas', function (Blueprint $table) {
            $table->dropColumn(['year', 'rating', 'views']);
        });
    }
};
