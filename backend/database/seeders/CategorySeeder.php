<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Alimentação',
            'Saúde',
            'Educação',
            'Beleza e Estética',
            'Academia e Bem-estar',
            'Vestuário',
            'Lazer e Entretenimento',
            'Serviços Automotivos',
            'Farmácia',
            'Tecnologia',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }
    }
}
