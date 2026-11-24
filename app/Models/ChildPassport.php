<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChildPassport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'parent_id',
        'name',
        'age',
        'avatar',
        'total_points',
        'current_level',
    ];

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function childRewards()
    {
        return $this->hasMany(ChildReward::class);
    }

    public function aiChallenges()
    {
        return $this->hasMany(AiChallenge::class);
    }
}