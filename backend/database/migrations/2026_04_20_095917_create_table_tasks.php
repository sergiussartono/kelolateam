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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); //assignee
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->enum('priority', ['urgent', 'normal', 'low'])->default('normal');
            $table->enum('status', ['todo', 'doing', 'review', 'approved'])->default('todo');
            $table->integer('progress')->default(0);
            $table->string('file_path')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
