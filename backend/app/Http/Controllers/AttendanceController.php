<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;

class AttendanceController extends Controller
{

    public function index()
    {
        $attendances = Attendance::where('user_id', auth()->id())
                                ->orderBy('date', 'desc')
                                ->get();
                                
        return response()->json($attendances);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'              => 'required|date',
            'clock_in'          => 'nullable|date_format:H:i',
            'location_lat'      => 'nullable|numeric',
            'location_long'     => 'nullable|numeric',
            'status'            => 'required|in:hadir,lambat,izin,alpha',
            'remarks'           => 'nullable|string',
            'is_within_radius'  => 'boolean',
        ]);

        $existing = Attendance::where('user_id', auth()->id())
                            ->where('date', $validated['date'])
                            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Absensi hari ini sudah tercatat'
            ], 422);
        }

        $attendance = Attendance::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return response()->json($attendance, 201);
    }

   
    public function show(string $id)
    {
        
    }

    
    public function update(Request $request, string $id)
    {
        $attendance = Attendance::where('user_id', auth()->id())
                                ->findOrFail($id);

        $attendance->update($request->validate([
            'clock_in'          => 'nullable|date_format:H:i', 
            'location_lat'      => 'nullable|numeric',
            'location_long'     => 'nullable|numeric',
            'status'            => 'in:hadir,lambat,izin,alpha',
            'remarks'           => 'nullable|string',
            'is_within_radius'  => 'boolean',
        ]));

        return response()->json($attendance);
    }


    public function destroy(string $id)
    {
        Attendance::where('user_id', auth()->id())
                ->findOrFail($id)
                ->delete();
        return response()->json(['message' => 'Data absensi dihapus']);
    }
}
