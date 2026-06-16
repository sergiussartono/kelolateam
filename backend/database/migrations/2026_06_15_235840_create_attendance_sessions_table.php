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
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // leader
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->nullable();   // kapan sesi absensi ditutup
            $table->decimal('center_lat', 10, 8);   // koordinat leader saat buka sesi
            $table->decimal('center_long', 11, 8);  // koordinat leader saat buka sesi
            $table->integer('radius_meter')->default(100); // radius yang diizinkan
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};