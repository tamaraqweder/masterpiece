<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChildReward extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'child_passport_id',
        'reward_id',
        'earned_points',
        'status',
    ];

    public function childPassport()
    {
        return $this->belongsTo(ChildPassport::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
}