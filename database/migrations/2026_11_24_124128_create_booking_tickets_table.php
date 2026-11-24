<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings');
            $table->foreignId('ticket_type_id')->constrained('ticket_types');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 3); //سعر التذكرة الواحدة
            $table->decimal('subtotal', 10, 3); //لسعر الإجمالي لهذا النوع
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_tickets');
    }
};