<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'status',
        'capacity_percentage'
    ];

    public function members() {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id')
                    ->withPivot('role', 'status_online')
                    ->withTimestamps();
    }
    public function tasks() {
        return $this->hasMany(Task::class);
    }
    public function insights() {
        return $this->morphMany(Insight::class, 'target');
    }
}
