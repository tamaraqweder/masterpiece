<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimeSlot extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'start_at',
        'end_at',
        'capacity',
        'status',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}