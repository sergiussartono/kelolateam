<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::whereHas('team.members', function($query) {
        $query->where('user_id', auth()->id());
        })->with('team', 'assignee')->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id'     => 'required|exists:teams,id',
            'user_id'     => 'nullable|exists:users,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'required|date',
            'priority'    => 'in:urgent,normal,low',       
            'status'      => 'in:todo,doing,review,approved', 
            'progress'    => 'integer|min:0|max:100',      
            'file_path'   => 'nullable|string',    
                    
        ]);

        $task = Task::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);
        return response()->json($task->load('team', 'assignee'), 201);
    }

    public function show(string $id)
    {
        $task = Task::with('team', 'assignee')->findOrFail($id);
        return response()->json($task);
    }

    public function viewFile($id)
    {
        // 1. Cari data tugas
        $task = Task::findOrFail($id);

        // 2. Validasi keberadaan path file di storage
        if (!$task->file_path || !Storage::disk('public')->exists($task->file_path)) {
            return response()->json(['message' => 'Berkas tidak ditemukan'], 404);
        }

        // 3. Dapatkan path absolut file di dalam folder storage backend
        $absolutePath = Storage::disk('public')->path($task->file_path);
        $mimeType = mime_Content_type($absolutePath);

        // 4. Kembalikan respons file mentah bersama tipe konten aslinya (Image/PDF/Docx)
        return response()->file($absolutePath, [
            'Content-Type' => $mimeType,
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Type'
        ]);
    }
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'sometimes|date',
            'priority'    => 'in:urgent,normal,low',
            'status'      => 'in:todo,doing,review,approved',
            'progress'    => 'integer|min:0|max:100',
            'user_id'     => 'nullable|exists:users,id',
            'file'        => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,zip|max:5120', // Maks 5MB
        ]);

        // Proses unggah file jika disertakan
        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($task->file_path) {
                Storage::disk('public')->delete($task->file_path);
            }
            $path = $request->file('file')->store('attachments', 'public');
            $validated['file_path'] = $path;
        }

        $task->update($validated);
        return response()->json($task->load('team', 'assignee'));
    }

    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        if ($task->file_path) {
            Storage::disk('public')->delete($task->file_path);
        }   
        $task->delete();
        return response()->json(['message' => 'Tugas dihapus']);
    }
}