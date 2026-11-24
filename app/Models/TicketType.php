<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'is_active',
    ];

    public function bookingTickets()
    {
        return $this->hasMany(BookingTicket::class);
    }
}