<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;

class TaskController extends Controller
{

    public function index()
    {
        $tasks = Task::with('team', 'assignee')
                     ->where('user_id', auth()->id())
                     ->get();
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

        $task = Task::create($validated);
        return response()->json($task->load('team', 'assignee'), 201);
    }

   
    public function show(string $id)
    {
        $task = Task::with('team', 'assignee')->findOrFail($id);
        return response()->json($task);
    }

    
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'sometimes|date',
            'priority'    => 'in:urgent,normal,low',
            'status'      => 'in:todo,doing,review,approved',
            'progress'    => 'integer|min:0|max:100',
            'file_path'   => 'nullable|string',
            'user_id'     => 'nullable|exists:users,id',
        ]));
        return response()->json($task->load('team', 'assignee'));
    }

    
    public function destroy(string $id)
    {
        Task::findOrFail($id)->delete();
        return response()->json(['message' => 'Tugas dihapus']);
    }
}
