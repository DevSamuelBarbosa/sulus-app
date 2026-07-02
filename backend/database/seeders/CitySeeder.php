<?php

namespace Database\Seeders;

use App\Models\State;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/ibge_cities.json');
        $cities = json_decode(file_get_contents($path), true);

        // The first 2 digits of a municipality IBGE code are its state IBGE code.
        // Resolving by this prefix is more robust than the (sometimes null) uf
        // field returned for newly-created municipalities.
        $stateIdsByCode = State::pluck('id', 'ibge_code');

        $rows = [];
        foreach ($cities as $city) {
            $stateId = $stateIdsByCode[substr($city['ibge_code'], 0, 2)] ?? null;
            if ($stateId === null) {
                continue;
            }

            $rows[] = [
                'ibge_code' => $city['ibge_code'],
                'state_id' => $stateId,
                'name' => $city['name'],
                'latitude' => null,
                'longitude' => null,
            ];
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('cities')->upsert($chunk, ['ibge_code'], ['name', 'state_id']);
        }

        $this->command?->info('Cities seeded: '.count($rows));
    }
}
