<?php

namespace Database\Seeders;

use App\Models\State;
use Illuminate\Database\Seeder;

class StateSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/ibge_states.json');
        $states = json_decode(file_get_contents($path), true);

        foreach ($states as $state) {
            State::updateOrCreate(
                ['ibge_code' => $state['ibge_code']],
                ['uf' => $state['uf'], 'name' => $state['name']],
            );
        }

        $this->command?->info('States seeded: '.count($states));
    }
}
