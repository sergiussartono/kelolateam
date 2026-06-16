<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\InsightController;

// 1. RUTE PUBLIK (Bisa diakses tanpa token)
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Tambahan Fallback Rute Login Palsu agar Laravel tidak Crash jika Token Frontend Kosong/Gagal
Route::get('/login', function () {
    return response()->json([
        'status'  => 'error',
        'message' => 'Unauthenticated. Token Sanctum tidak ditemukan atau telah kedaluwarsa. Silakan login ulang.'
    ], 401);
})->name('login');


// 2. RUTE TERPROTEKSI SANCTUM (Wajib membawa Bearer Token)
Route::middleware('auth:sanctum')->group(function () {

    // Modul Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Modul Kelola Tim (Sudah dibersihkan dari duplikasi baris)
    Route::get('/teams/search-user',              [TeamController::class, 'searchUser']);
    Route::post('/teams/{id}/members',            [TeamController::class, 'addMember']);
    Route::delete('/teams/{id}/members/{userId}', [TeamController::class, 'removeMember']);
    Route::apiResource('teams', TeamController::class);

    // Modul Tugas / Kanban Board
    Route::apiResource('tasks', TaskController::class);
    Route::get('/tasks/view-file/{id}', [TaskController::class, 'viewFile']);    
    // Modul Absensi (Attendance)
    Route::apiResource('attendances', AttendanceController::class)->except(['show']);

    // Modul Sesi Absensi (Leader)
    Route::post('/attendance-sessions', [AttendanceSessionController::class, 'store']);
    Route::get('/attendance-sessions/{teamId}', [AttendanceSessionController::class, 'index']);
    Route::get('/attendance-sessions/detail/{id}', [AttendanceSessionController::class, 'show']);
    Route::patch('/attendance-sessions/{id}/close', [AttendanceSessionController::class, 'close']);
    

    // Modul Notifikasi
    Route::get('notifications',             [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('notifications/read-all',  [NotificationController::class, 'markAllRead']);
    Route::delete('notifications/{id}',     [NotificationController::class, 'destroy']);

    // Modul AI Insight
    Route::get('insights/user',           [InsightController::class, 'userInsights']);
    Route::get('insights/team/{teamId}',  [InsightController::class, 'teamInsights']);
});