<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'session_id', //
        'date',
        'clock_in',
        'location_lat',
        'location_long',
        'status',
        'remarks',
        'is_within_radius',
        'is_mock_location', //
        'office_distance_meter', //
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function session() //
    {
        return $this->belongsTo(AttendanceSession::class, 'session_id');
    }
}