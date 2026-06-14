<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
  
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
                                     ->orderBy('created_at', 'desc')
                                     ->get();
        return response()->json($notifications);

    }


    public function markRead($id)
    {
        $notification = Notification::where('user_id', auth()->id())
                                    ->findOrFail($id);

        $notification->update([
            'read_at' => now()
        ]);

        return response()->json(['message' => 'Notifikasi ditandai dibaca']);
    }
    

    public function markAllRead()
    {
        Notification::where('user_id', auth()->id())
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi dibaca']);
    }


    public function store(Request $request)
    {
        //
    }


    public function show(string $id)
    {
        //
    }

  
    public function update(Request $request, string $id)
    {
        //
    }

  
    public function destroy(string $id)
    {
        Notification::where('user_id', auth()->id())
                    ->findOrFail($id)
                    ->delete();
        return response()->json(['message' => 'Notifikasi dihapus']);
    }
}
