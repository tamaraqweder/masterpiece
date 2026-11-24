<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('title');
            $table->string('campaign_goal');
            $table->string('target_audience')->nullable();
            $table->text('description')->nullable();
            $table->string('content_language');
            $table->string('content_style')->nullable();
            $table->json('ai_content')->nullable();
            $table->string('poster_image')->nullable();
            $table->string('tracking_code')->unique();
            $table->integer('visit_count')->default(0);
            $table->enum('status', ['draft', 'active', 'completed', 'archived'])->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};