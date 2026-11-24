<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiChallenge extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'child_passport_id',
        'category',
        'question',
        'option_one',
        'option_two',
        'option_three',
        'option_four',
        'correct_answer',
        'child_answer',
        'explanation',
        'is_correct',
        'earned_points',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function childPassport()
    {
        return $this->belongsTo(ChildPassport::class);
    }
}