<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return response()->json([
        'app'     => 'KelolaTeam API',
        'version' => '1.0.0',
        'status'  => 'running',
    ]);
});
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');