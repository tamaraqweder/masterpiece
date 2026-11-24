<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'campaign_goal',
        'target_audience',
        'description',
        'content_language',
        'content_style',
        'ai_content',
        'poster_image',
        'tracking_code',
        'visit_count',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'ai_content' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function aiGenerations()
    {
        return $this->hasMany(AiGeneration::class);
    }
}