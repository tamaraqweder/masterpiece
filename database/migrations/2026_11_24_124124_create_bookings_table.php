<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('time_slot_id')->constrained('time_slots');
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns');

            $table->string('booking_number')->unique();
            $table->string('qr_code_token')->nullable()->unique();
            $table->integer('visitor_count');
            $table->decimal('total_price', 10, 3);

            $table->enum('status', [
                   'confirmed',
                  'waiting',
                   'inside',
                  'completed',
                  'cancelled',
                 'absent'
              ])->default('confirmed');

            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('entry_time')->nullable();
            $table->dateTime('completion_time')->nullable();
            $table->dateTime('cancellation_time')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};