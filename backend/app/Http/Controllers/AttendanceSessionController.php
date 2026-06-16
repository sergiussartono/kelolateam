<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AttendanceSession;
use App\Models\TeamMember;

class AttendanceSessionController extends Controller
{
    // Leader lihat semua sesi absensi milik timnya
    public function index($teamId)
    {
        $sessions = AttendanceSession::where('team_id', $teamId)
                                     ->with('creator', 'attendances.user')
                                     ->orderBy('date', 'desc')
                                     ->get();
        return response()->json($sessions);
    }

    // Leader buka sesi absensi baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id'      => 'required|exists:teams,id',
            'center_lat'   => 'required|numeric',   // koordinat leader
            'center_long'  => 'required|numeric',   // koordinat leader
            'radius_meter' => 'integer|min:10|max:1000',
            'start_time'   => 'required|date_format:H:i',
        ]);

        // Pastikan yang membuat adalah leader tim
        $isLeader = TeamMember::where('team_id', $validated['team_id'])
                            ->where('user_id', auth()->id())
                            ->where('role', 'leader')
                            ->exists();

        if (!$isLeader) {
            return response()->json([
                'message' => 'Hanya leader tim yang bisa membuka sesi absensi'
            ], 403);
        }

        // Cek apakah sudah ada sesi yang masih open di tim ini hari ini
        $existingSession = AttendanceSession::where('team_id', $validated['team_id'])
                                            ->where('date', now()->toDateString())
                                            ->where('status', 'open')
                                            ->first();

        if ($existingSession) {
            return response()->json([
                'message' => 'Sudah ada sesi absensi yang sedang berjalan untuk tim ini'
            ], 422);
        }

        $session = AttendanceSession::create([
            'team_id'      => $validated['team_id'],
            'created_by'   => auth()->id(),
            'date'         => now()->toDateString(),
            'start_time'   => $validated['start_time'],
            'center_lat'   => $validated['center_lat'],   // koordinat leader tersimpan
            'center_long'  => $validated['center_long'],  // koordinat leader tersimpan
            'radius_meter' => $validated['radius_meter'] ?? 100,
            'status'       => 'open',
        ]);

        return response()->json($session->load('creator'), 201);
    }

    // Leader tutup sesi absensi
    public function close($id)
    {
        $session = AttendanceSession::findOrFail($id);

        // Pastikan yang menutup adalah pembuatnya
        if ($session->created_by !== auth()->id()) {
            return response()->json([
                'message' => 'Hanya pembuat sesi yang bisa menutup sesi ini'
            ], 403);
        }

        $session->update([
            'status'   => 'closed',
            'end_time' => now()->format('H:i'),
        ]);

        return response()->json([
            'message' => 'Sesi absensi ditutup',
            'session' => $session
        ]);
    }

    // Lihat detail sesi beserta siapa saja yang sudah absen
    public function show($id)
    {
        $session = AttendanceSession::with('creator', 'attendances.user')
                                    ->findOrFail($id);
        return response()->json($session);
    }
}