<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeamFactory extends Factory
{
    protected $model = Team::class;
    
    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Team',
            'category' => $this->faker->randomElement(['Web Dev', 'Mobile App']),
            'status' => $this->faker->randomElement(['baru', 'aktif', 'arsip']),
            'capacity_percentage' => $this->faker->numberBetween(10, 100),
        ];
    }
}
