<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'date',
        'clock_in',
        'location_lat',
        'location_long',
        'status',
        'remarks',
        'is_within_radius'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
