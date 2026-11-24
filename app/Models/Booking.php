<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'time_slot_id',
        'campaign_id',
        'booking_number',
        'qr_code_token',
        'visitor_count',
        'total_price',
        'status',
        'check_in_time',
        'entry_time',
        'completion_time',
        'cancellation_time',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'entry_time' => 'datetime',
        'completion_time' => 'datetime',
        'cancellation_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function bookingTickets()
    {
        return $this->hasMany(BookingTicket::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}