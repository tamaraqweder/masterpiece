<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiGeneration extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'campaign_id',
        'prompt',
        'generated_text',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}