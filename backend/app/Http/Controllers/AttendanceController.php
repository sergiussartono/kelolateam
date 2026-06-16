<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\TeamMember;
use App\Models\AttendanceSession;

class AttendanceController extends Controller
{

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // radius bumi dalam meter

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

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
            'session_id'       => 'required_if:status,hadir,lambat|exists:attendance_sessions,id', // ← wajib kirim session_id
            'date'             => 'required|date',
            'clock_in'         => 'nullable|date_format:H:i',
            'location_lat'     => 'required|numeric',
            'location_long'    => 'required|numeric',
            'status'           => 'required|in:hadir,lambat,izin,alpha',
            'remarks'          => 'nullable|string',
            'is_mock_location' => 'boolean',
        ]);

        // Ambil sesi absensi yang dibuat leader
        $session = AttendanceSession::findOrFail($validated['session_id']);

        // Cek apakah sesi masih open
        if ($session->status !== 'open') {
            return response()->json([
                'message' => 'Sesi absensi sudah ditutup'
            ], 422);
        }

        // Cek apakah user adalah anggota tim ini
        $isMember = TeamMember::where('team_id', $session->team_id)
                            ->where('user_id', auth()->id())
                            ->exists();

        if (!$isMember) {
            return response()->json([
                'message' => 'Kamu bukan anggota tim ini'
            ], 403);
        }

        // Cegah duplikat absensi di sesi yang sama
        $existing = Attendance::where('user_id', auth()->id())
                            ->where('session_id', $validated['session_id'])
                            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Kamu sudah absen di sesi ini'
            ], 422);
        }

        // Tolak jika terdeteksi fake GPS
        if (!empty($validated['is_mock_location']) && $validated['is_mock_location']) {
            return response()->json([
                'message' => 'Terdeteksi penggunaan lokasi palsu (fake GPS)'
            ], 422);
        }

        // Hitung jarak ke koordinat leader (pusat sesi)
        $distance = $this->calculateDistance(
            $validated['location_lat'],
            $validated['location_long'],
            $session->center_lat,    // ← koordinat leader, bukan dari .env
            $session->center_long
        );

        $isWithinRadius = $distance <= $session->radius_meter;

        if (!$isWithinRadius) {
            return response()->json([
                'message' => 'Lokasi kamu terlalu jauh. Jarak kamu: '
                            . round($distance) . ' meter, maksimal '
                            . $session->radius_meter . ' meter.'
            ], 422);
        }

        $attendance = Attendance::create([
            ...$validated,
            'user_id'               => auth()->id(),
            'is_within_radius'      => $isWithinRadius,
            'is_mock_location'      => $validated['is_mock_location'] ?? false,
            'office_distance_meter' => round($distance, 2),
        ]);

        return response()->json($attendance->load('session'), 201);
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
