<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_passport_id')->constrained('child_passports');
            $table->string('category');
            $table->text('question');
            $table->string('option_one');
            $table->string('option_two');
            $table->string('option_three');
            $table->string('option_four');
            $table->unsignedTinyInteger('correct_answer');
            $table->unsignedTinyInteger('child_answer')->nullable();
            $table->text('explanation')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->unsignedInteger('earned_points')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_challenges');
    }
};