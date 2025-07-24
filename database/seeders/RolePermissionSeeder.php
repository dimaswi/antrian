<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // User Management
            ['name' => 'user.view', 'display_name' => 'Lihat User', 'description' => 'Dapat melihat daftar user', 'module' => 'User Management'],
            ['name' => 'user.create', 'display_name' => 'Tambah User', 'description' => 'Dapat menambah user baru', 'module' => 'User Management'],
            ['name' => 'user.edit', 'display_name' => 'Edit User', 'description' => 'Dapat mengedit data user', 'module' => 'User Management'],
            ['name' => 'user.delete', 'display_name' => 'Hapus User', 'description' => 'Dapat menghapus user', 'module' => 'User Management'],
            
            // Role Management
            ['name' => 'role.view', 'display_name' => 'Lihat Role', 'description' => 'Dapat melihat daftar role', 'module' => 'Role Management'],
            ['name' => 'role.create', 'display_name' => 'Tambah Role', 'description' => 'Dapat menambah role baru', 'module' => 'Role Management'],
            ['name' => 'role.edit', 'display_name' => 'Edit Role', 'description' => 'Dapat mengedit role', 'module' => 'Role Management'],
            ['name' => 'role.delete', 'display_name' => 'Hapus Role', 'description' => 'Dapat menghapus role', 'module' => 'Role Management'],
            
            // Permission Management
            ['name' => 'permission.view', 'display_name' => 'Lihat Permission', 'description' => 'Dapat melihat daftar permission', 'module' => 'Permission Management'],
            ['name' => 'permission.create', 'display_name' => 'Tambah Permission', 'description' => 'Dapat menambah permission baru', 'module' => 'Permission Management'],
            ['name' => 'permission.edit', 'display_name' => 'Edit Permission', 'description' => 'Dapat mengedit permission', 'module' => 'Permission Management'],
            ['name' => 'permission.delete', 'display_name' => 'Hapus Permission', 'description' => 'Dapat menghapus permission', 'module' => 'Permission Management'],
            
            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'Lihat Dashboard', 'description' => 'Dapat mengakses dashboard', 'module' => 'Dashboard'],
            ['name' => 'dashboard.antrian', 'display_name' => 'Lihat Dashboard Antrian', 'description' => 'Dapat mengakses dashboard antrian', 'module' => 'Dashboard'],

            // Settings
            ['name' => 'settings.view', 'display_name' => 'Lihat Settings', 'description' => 'Dapat melihat pengaturan', 'module' => 'Settings'],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'description' => 'Dapat mengedit pengaturan', 'module' => 'Settings'],
            
            // Antrian - Room Management
            ['name' => 'room.view', 'display_name' => 'Lihat Ruangan', 'description' => 'Dapat melihat daftar ruangan antrian', 'module' => 'Antrian Management'],
            ['name' => 'room.create', 'display_name' => 'Tambah Ruangan', 'description' => 'Dapat menambah ruangan antrian baru', 'module' => 'Antrian Management'],
            ['name' => 'room.edit', 'display_name' => 'Edit Ruangan', 'description' => 'Dapat mengedit data ruangan antrian', 'module' => 'Antrian Management'],
            ['name' => 'room.delete', 'display_name' => 'Hapus Ruangan', 'description' => 'Dapat menghapus ruangan antrian', 'module' => 'Antrian Management'],
            
            // Antrian - Counter Management
            ['name' => 'counter.view', 'display_name' => 'Lihat Loket', 'description' => 'Dapat melihat daftar loket', 'module' => 'Antrian Management'],
            ['name' => 'counter.create', 'display_name' => 'Tambah Loket', 'description' => 'Dapat menambah loket baru', 'module' => 'Antrian Management'],
            ['name' => 'counter.edit', 'display_name' => 'Edit Loket', 'description' => 'Dapat mengedit data loket', 'module' => 'Antrian Management'],
            ['name' => 'counter.delete', 'display_name' => 'Hapus Loket', 'description' => 'Dapat menghapus loket', 'module' => 'Antrian Management'],
            
            // Antrian - Queue Management
            ['name' => 'queue.view', 'display_name' => 'Lihat Antrian', 'description' => 'Dapat melihat daftar antrian', 'module' => 'Antrian Management'],
            ['name' => 'queue.create', 'display_name' => 'Buat Antrian', 'description' => 'Dapat membuat nomor antrian baru', 'module' => 'Antrian Management'],
            ['name' => 'queue.call', 'display_name' => 'Panggil Antrian', 'description' => 'Dapat memanggil antrian berikutnya', 'module' => 'Antrian Management'],
            ['name' => 'queue.serve', 'display_name' => 'Layani Antrian', 'description' => 'Dapat melayani antrian', 'module' => 'Antrian Management'],
            ['name' => 'queue.complete', 'display_name' => 'Selesaikan Antrian', 'description' => 'Dapat menyelesaikan antrian', 'module' => 'Antrian Management'],
            ['name' => 'queue.cancel', 'display_name' => 'Batalkan Antrian', 'description' => 'Dapat membatalkan antrian', 'module' => 'Antrian Management'],
            ['name' => 'queue.statistics', 'display_name' => 'Statistik Antrian', 'description' => 'Dapat melihat statistik antrian', 'module' => 'Antrian Management'],
            ['name' => 'queue.dashboard', 'display_name' => 'Dashboard Antrian', 'description' => 'Dapat mengakses dashboard antrian', 'module' => 'Antrian Management'],
            
            // Antrian - Display Management
            ['name' => 'display.view', 'display_name' => 'Display Menu', 'description' => 'Dapat mengakses display antrian Menu', 'module' => 'Antrian Display'],
            ['name' => 'display.universal', 'display_name' => 'Display Universal', 'description' => 'Dapat mengakses display antrian universal', 'module' => 'Antrian Display'],
            ['name' => 'display.room', 'display_name' => 'Display Ruangan', 'description' => 'Dapat mengakses display antrian per ruangan', 'module' => 'Antrian Display'],
            ['name' => 'display.counter', 'display_name' => 'Display Loket', 'description' => 'Dapat mengakses display antrian per loket', 'module' => 'Antrian Display'],
            
            // Antrian - Kiosk Management (Public access, but still need permissions for admin)
            ['name' => 'kiosk.manage', 'display_name' => 'Kelola Kiosk', 'description' => 'Dapat mengelola pengaturan kiosk antrian', 'module' => 'Antrian Kiosk'],
            
            // Antrian - Operator Management
            ['name' => 'operator.dashboard', 'display_name' => 'Dashboard Operator', 'description' => 'Dapat mengakses dashboard operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.call', 'display_name' => 'Panggil Antrian (Operator)', 'description' => 'Dapat memanggil antrian sebagai operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.serve', 'display_name' => 'Layani Antrian (Operator)', 'description' => 'Dapat melayani antrian sebagai operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.complete', 'display_name' => 'Selesaikan Antrian (Operator)', 'description' => 'Dapat menyelesaikan antrian sebagai operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.skip', 'display_name' => 'Lewati Antrian (Operator)', 'description' => 'Dapat melewati/membatalkan antrian sebagai operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.recall', 'display_name' => 'Panggil Ulang Antrian (Operator)', 'description' => 'Dapat memanggil ulang antrian sebagai operator', 'module' => 'Antrian Operator'],
            ['name' => 'operator.activity', 'display_name' => 'Aktivitas Operator', 'description' => 'Dapat melihat riwayat aktivitas operator', 'module' => 'Antrian Operator'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Administrator dengan akses penuh ke semua fitur sistem'
            ]
        );

        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            [
                'display_name' => 'User',
                'description' => 'User biasa dengan akses terbatas'
            ]
        );

        // Antrian Specific Roles
        $antrianAdminRole = Role::firstOrCreate(
            ['name' => 'antrian_admin'],
            [
                'display_name' => 'Administrator Antrian',
                'description' => 'Administrator khusus untuk mengelola sistem antrian'
            ]
        );

        $operatorRole = Role::firstOrCreate(
            ['name' => 'operator'],
            [
                'display_name' => 'Operator Antrian',
                'description' => 'Operator yang bertugas melayani antrian di loket'
            ]
        );

        $displayRole = Role::firstOrCreate(
            ['name' => 'display'],
            [
                'display_name' => 'Display Antrian',
                'description' => 'Role untuk mengakses display antrian saja'
            ]
        );

        // Assign permissions to Admin (all permissions)
        $allPermissions = Permission::all();
        $adminRole->permissions()->sync($allPermissions->pluck('id'));

        // Assign permissions to User (very limited permissions)
        $userPermissions = Permission::whereIn('name', [
            'dashboard.view'
        ])->pluck('id');
        $userRole->permissions()->sync($userPermissions);

        // Assign permissions to Antrian Admin
        $antrianAdminPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'room.view', 'room.create', 'room.edit', 'room.delete',
            'counter.view', 'counter.create', 'counter.edit', 'counter.delete',
            'queue.view', 'queue.create', 'queue.call', 'queue.serve', 'queue.complete', 'queue.cancel',
            'queue.statistics', 'queue.dashboard',
            'display.universal', 'display.room', 'display.counter',
            'kiosk.manage',
            'operator.dashboard', 'operator.activity'
        ])->pluck('id');
        $antrianAdminRole->permissions()->sync($antrianAdminPermissions);

        // Assign permissions to Operator
        $operatorPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'queue.view',
            'operator.dashboard', 'operator.call', 'operator.serve', 'operator.complete', 
            'operator.skip', 'operator.recall', 'operator.activity'
        ])->pluck('id');
        $operatorRole->permissions()->sync($operatorPermissions);

        // Assign permissions to Display (for display terminals)
        $displayPermissions = Permission::whereIn('name', [
            'display.universal', 'display.room', 'display.counter'
        ])->pluck('id');
        $displayRole->permissions()->sync($displayPermissions);
    }
}
