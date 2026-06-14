<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function GuzzleHttp\default_ca_bundle;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('clock_in')->nullable();
            $table->decimal('location_lat', 10, 8)->nullable(); //8 digit angka belakang koma
            $table->decimal('location_long', 11, 8)->nullable();
            $table->enum('status', ['hadir', 'lambat', 'izin', 'alpha']);
            $table->string('remarks')->nullable();
            $table->boolean('is_within_radius')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
