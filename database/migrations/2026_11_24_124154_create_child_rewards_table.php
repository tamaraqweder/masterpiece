<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_passport_id')->constrained('child_passports');
            $table->foreignId('reward_id')->constrained('rewards');
            $table->unsignedInteger('earned_points');
            $table->enum('status', ['earned', 'received'])->default('earned');
            $table->unique(['child_passport_id', 'reward_id']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_rewards');
    }
};