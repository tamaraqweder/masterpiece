<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookingTicket extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'ticket_type_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }
    //مسؤول عن تفاصيل التذاكر داخل كل حجز
}



