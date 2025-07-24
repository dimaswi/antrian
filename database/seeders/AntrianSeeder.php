<?php

namespace Database\Seeders;

use App\Models\Antrian\Room;
use App\Models\Antrian\Counter;
use Illuminate\Database\Seeder;

class AntrianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Rooms
        $rooms = [
            [
                'name' => 'Pendaftaran',
                'code' => 'REG',
                'description' => 'Ruang pendaftaran pasien',
                'is_active' => true,
                'prefix' => 'A'
            ],
            [
                'name' => 'Poli Umum',
                'code' => 'POLUM',
                'description' => 'Poliklinik umum',
                'is_active' => true,
                'prefix' => 'B'
            ],
            [
                'name' => 'Poli Gigi',
                'code' => 'POLGI',
                'description' => 'Poliklinik gigi',
                'is_active' => true,
                'prefix' => 'C'
            ],
            [
                'name' => 'Farmasi',
                'code' => 'FARM',
                'description' => 'Ruang farmasi/apotek',
                'is_active' => true,
                'prefix' => 'D'
            ],
            [
                'name' => 'Laboratorium',
                'code' => 'LAB',
                'description' => 'Laboratorium',
                'is_active' => true,
                'prefix' => 'E'
            ]
        ];

        foreach ($rooms as $roomData) {
            $room = Room::create($roomData);
            
            // Create counters for each room
            $this->createCountersForRoom($room);
        }
    }

    /**
     * Create counters for specific room
     */
    private function createCountersForRoom(Room $room): void
    {
        $counters = [];

        switch ($room->code) {
            case 'REG':
                $counters = [
                    [
                        'name' => 'Pendaftaran Umum',
                        'code' => 'REG001',
                        'description' => 'Pendaftaran untuk pasien umum',
                        'type' => 'umum'
                    ],
                    [
                        'name' => 'Pendaftaran BPJS',
                        'code' => 'REG002',
                        'description' => 'Pendaftaran untuk pasien BPJS',
                        'type' => 'bpjs'
                    ],
                    [
                        'name' => 'Pendaftaran VIP',
                        'code' => 'REG003',
                        'description' => 'Pendaftaran untuk pasien VIP',
                        'type' => 'vip'
                    ]
                ];
                break;

            case 'POLUM':
                $counters = [
                    [
                        'name' => 'Poli Umum 1',
                        'code' => 'POLUM001',
                        'description' => 'Poliklinik umum ruang 1',
                        'type' => 'general'
                    ],
                    [
                        'name' => 'Poli Umum 2',
                        'code' => 'POLUM002',
                        'description' => 'Poliklinik umum ruang 2',
                        'type' => 'general'
                    ]
                ];
                break;

            case 'POLGI':
                $counters = [
                    [
                        'name' => 'Poli Gigi 1',
                        'code' => 'POLGI001',
                        'description' => 'Poliklinik gigi ruang 1',
                        'type' => 'general'
                    ],
                    [
                        'name' => 'Poli Gigi 2',
                        'code' => 'POLGI002',
                        'description' => 'Poliklinik gigi ruang 2',
                        'type' => 'general'
                    ]
                ];
                break;

            case 'FARM':
                $counters = [
                    [
                        'name' => 'Farmasi Racikan',
                        'code' => 'FARM001',
                        'description' => 'Farmasi untuk obat racikan',
                        'type' => 'racikan'
                    ],
                    [
                        'name' => 'Farmasi Non-Racikan',
                        'code' => 'FARM002',
                        'description' => 'Farmasi untuk obat non-racikan',
                        'type' => 'non_racikan'
                    ]
                ];
                break;

            case 'LAB':
                $counters = [
                    [
                        'name' => 'Lab Darah',
                        'code' => 'LAB001',
                        'description' => 'Laboratorium pemeriksaan darah',
                        'type' => 'darah'
                    ],
                    [
                        'name' => 'Lab Urin',
                        'code' => 'LAB002',
                        'description' => 'Laboratorium pemeriksaan urin',
                        'type' => 'urin'
                    ]
                ];
                break;

            default:
                $counters = [
                    [
                        'name' => $room->name . ' Counter 1',
                        'code' => $room->code . '001',
                        'description' => 'Counter default untuk ' . $room->name,
                        'type' => 'general'
                    ]
                ];
                break;
        }

        foreach ($counters as $counterData) {
            Counter::create([
                'room_id' => $room->id,
                'name' => $counterData['name'],
                'code' => $counterData['code'],
                'description' => $counterData['description'],
                'type' => $counterData['type'],
                'is_active' => true,
                'current_queue_number' => 0
            ]);
        }
    }
}
