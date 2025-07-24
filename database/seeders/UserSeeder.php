<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        
        User::create([
            'name' => 'Dimas Wisnu Wirawan',
            'nip' => '2023.01.02.03',
            'password' => bcrypt('12345'),
            'role_id' => $adminRole->id, // Assuming role_id is the foreign key in users table
        ]);

    }
}
