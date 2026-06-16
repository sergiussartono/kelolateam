<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Team;

class TeamController extends Controller
{
    public function index()
    {
        // Mengambil tim milik user yang login dan anggotanya
        $teams = auth()->user()->teams()->with('members', 'tasks')->get();
        return response()->json($teams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category'      => 'required|string',
            'description'   => 'nullable|string',
            'status'        => 'in:baru,aktif,arsip',
        ]);

        $team = Team::create([
            ...$validated,
            'created_by'    => auth()->id(),
        ]);

        $team->members()->attach(auth()->id(), ['role' => 'leader']);

        return response()->json($team->load('members'), 201);
    }

   
    public function show(string $id)
    {
        $team = Team::with('members', 'tasks')->findOrFail($id);
        return response()->json($team);
    }

    
    public function update(Request $request, string $id)
    {
        $team = Team::findOrFail($id);
        $team->update($request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'        => 'in:baru,aktif,arsip',
        ]));
        return response()->json($team);
    }

    
    public function destroy(string $id)
    {
        Team::findOrFail($id)->delete();
        return response()->json(['message' => 'Tim dihapus']);
    }

    public function searchUser(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)
                    ->select('id', 'name', 'email', 'avatar_color')
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json($user);
    }

    public function addMember(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role'    => 'in:leader,member',
        ]);

        $team = Team::findOrFail($id);
        $team->members()->syncWithoutDetaching([
            $request->user_id => ['role' => $request->role ?? 'member']
        ]);

        return response()->json(['message' => 'Anggota ditambahkan']);
    }


    public function removeMember($id, $userId)
    {
        $team = Team::findOrFail($id);
        $team->members()->detach($userId);
        return response()->json(['message' => 'Anggota dihapus']);
    }
}
