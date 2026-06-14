<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;    

    public function definition(): array
    {
        return [
            'user_id' => Team::inRandomOrder()->first()?->id ?? Team::factory(),
            'team_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'due_date' => $this->faker->dateTimeBetween('now', '+2 weeks')->format('Y-m-d'),
            'priority' => $this->faker->randomElement(['urgent', 'normal', 'low']),
            'status' => $this->faker->randomElement(['todo', 'doing', 'review', 'approved']),
            'progress' => $this->faker->numberBetween(0,100),
            'file_path' => null,
        ];
    }
}
