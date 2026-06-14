<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Insight;
use App\Models\User;
use App\Models\Team;

class InsightController extends Controller
{

    public function userInsights()
    {
        $insights = auth()->user()->insights()->latest()->get();
        return response()->json($insights);
    }


    public function teamInsights($teamId)
    {
        $team     = Team::findOrFail($teamId);
        $insights = $team->insights()->latest()->get();
        return response()->json($insights);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_type' => 'required|in:user,team',
            'target_id'   => 'required|integer',
            'content'     => 'required|string',
            'type'        => 'required|in:summary,recommendation,performance_score',
            'score'       => 'nullable|integer',
        ]);

        $targetClass = $validated['target_type'] === 'user' 
            ? User::class 
            : Team::class;

        $insight = Insight::create([
            'target_type' => $targetClass,
            'target_id'   => $validated['target_id'],
            'content'     => $validated['content'],
            'type'        => $validated['type'],
            'score'       => $validated['score'] ?? null,
        ]);

        return response()->json($insight, 201);
    }
}
