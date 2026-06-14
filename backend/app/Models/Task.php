<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'team_id',
        'title',
        'description',
        'due_date',
        'priority',
        'status',
        'progress',
        'file_path'
    ];
    public function team() {
        return $this->belongsTo(Team::class);
    }
    public function assignee() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
