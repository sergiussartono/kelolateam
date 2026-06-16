<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\InsightController;

//publik
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

//protected
Route::middleware('auth:sanctum')->group(function () {

    //auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    //tim
    Route::post('teams/{id}/members',          [TeamController::class, 'addMember']);
    Route::delete('teams/{id}/members/{userId}',[TeamController::class, 'removeMember']);
    Route::get('/teams/search-user', [TeamController::class, 'searchUser']);
    Route::post('/teams/{id}/members', [TeamController::class, 'addMember']);
    Route::delete('/teams/{id}/members/{userId}', [TeamController::class, 'removeMember']);
    Route::apiResource('teams', TeamController::class);

    //tugas
    Route::apiResource('tasks', TaskController::class);

    //attendance (absensi)
    Route::apiResource('attendances', AttendanceController::class)
        ->except(['show']);

    //notifikasi
    Route::get('notifications',             [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('notifications/read-all',  [NotificationController::class, 'markAllRead']);
    Route::delete('notifications/{id}',     [NotificationController::class, 'destroy']);

    //ai insight
    Route::get('insights/user',          [InsightController::class, 'userInsights']);
    Route::get('insights/team/{teamId}', [InsightController::class, 'teamInsights']);
    Route::post('insights',              [InsightController::class, 'store']);
});