<?php

namespace Database\Factories;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'date' => now()->format('Y-m-d'),
            'clock_in' => $this->faker->time('H:i:s'),
            'location_lat' => $this->faker->latitude(-7.8, -7.9),
            'location_long' => $this->faker->longitude(112.0, 112.1),
            'status' => $this->faker->randomElement(['hadir', 'lambat', 'izin', 'alpha']),
            'remarks' => $this->faker->sentence(),
            'is_within_radius' => $this->faker->boolean(80),
        ];
    }
}
