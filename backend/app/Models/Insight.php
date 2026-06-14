<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insight extends Model
{
    protected $table = 'ai_insights';
    
    protected $fillable = [
        'target_id',
        'target_type',
        'type',
        'content',
        'score'
    ];
    
    public function target() {
        return $this->morphTo();
    }
}
