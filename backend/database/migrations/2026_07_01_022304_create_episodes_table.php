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
        Schema::create('episodes', function (Blueprint $table) {
            $table->string('id', 255)->primary();
            $table->string('drama_id', 255);
            $table->integer('episode')->nullable();
            $table->string('title', 255);
            $table->text('videoUrl')->nullable();
            $table->timestamps();

            $table->foreign('drama_id')->references('id')->on('dramas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
