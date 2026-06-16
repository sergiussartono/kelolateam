<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttendanceSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'created_by',
        'date',
        'start_time',
        'end_time',
        'center_lat',
        'center_long',
        'radius_meter',
        'status',
    ];

    // Sesi ini milik tim mana
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    // Siapa leader yang membuat sesi ini
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Absensi anggota yang mengacu ke sesi ini
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'session_id');
    }
}