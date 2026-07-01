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
        Schema::create('dramas', function (Blueprint $table) {
            $table->string('id', 255)->primary();
            $table->string('title', 255);
            $table->string('titleKhmer', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('poster', 500)->nullable();
            $table->string('genre', 100)->nullable();
            $table->boolean('trending')->default(false);
            $table->string('status', 50)->nullable();
            $table->integer('totalEpisodes')->default(0);
            $table->string('source', 255)->nullable();
            $table->string('year', 10)->nullable()->default('2025');
            $table->string('rating', 10)->nullable()->default('8.0');
            $table->integer('views')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dramas');
    }
};
