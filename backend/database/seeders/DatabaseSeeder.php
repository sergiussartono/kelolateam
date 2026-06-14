<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use App\Models\Task;
use App\Models\Attendance;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {

        $users = User::factory(10)->create();
        $teams = Team::factory(3)->create();
        
        foreach ($teams as $team) {
            $randomUsers = $users->random(4);

            foreach ($randomUsers as $user) {
                $team->members()->attach($user->id, [
                    'role' => 'Member',
                    'status_online' => 'offline',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Task::factory(3)->create([
                    'team_id' => $team->id,
                    'user_id' => $user->id,
                ]);
            }

        }

        foreach ($users as $user) {
            Attendance::factory(10)->create([
                'user_id' => $user->id,
            ]);
        }

    }

}
