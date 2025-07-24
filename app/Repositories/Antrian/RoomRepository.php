<?php

namespace App\Repositories\Antrian;

use App\Models\Antrian\Room;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RoomRepository implements RoomRepositoryInterface
{
    /**
     * Get all rooms
     */
    public function getAll(): Collection
    {
        return Room::with(['counters'])->orderBy('name')->get();
    }

    /**
     * Get active rooms
     */
    public function getActive(): Collection
    {
        return Room::active()->with(['activeCounters'])->orderBy('name')->get();
    }

    /**
     * Find room by ID
     */
    public function findById(int $id): ?Room
    {
        return Room::with(['counters'])->find($id);
    }

    /**
     * Find room by code
     */
    public function findByCode(string $code): ?Room
    {
        return Room::where('code', $code)->first();
    }

    /**
     * Create new room
     */
    public function create(array $data): Room
    {
        return Room::create($data);
    }

    /**
     * Update room
     */
    public function update(int $id, array $data): bool
    {
        return Room::where('id', $id)->update($data);
    }

    /**
     * Delete room
     */
    public function delete(int $id): bool
    {
        return Room::destroy($id);
    }

    /**
     * Get rooms with counters
     */
    public function getWithCounters(): Collection
    {
        return Room::with(['counters' => function ($query) {
            $query->orderBy('name');
        }])->orderBy('name')->get();
    }

    /**
     * Get rooms with active counters
     */
    public function getWithActiveCounters(): Collection
    {
        return Room::with(['activeCounters' => function ($query) {
            $query->orderBy('name');
        }])
        ->withCount(['counters', 'activeCounters'])
        ->active()
        ->orderBy('name')
        ->get();
    }

    /**
     * Get room statistics for today
     */
    public function getTodayStatistics(int $roomId): array
    {
        $room = Room::with(['todayQueues', 'activeCounters'])->find($roomId);

        if (!$room) {
            return [];
        }

        $totalQueues = $room->todayQueues->count();
        $waitingQueues = $room->todayQueues->where('status', 'waiting')->count();
        $servingQueues = $room->todayQueues->where('status', 'serving')->count();
        $completedQueues = $room->todayQueues->where('status', 'completed')->count();
        $cancelledQueues = $room->todayQueues->where('status', 'cancelled')->count();

        return [
            'room' => $room,
            'total_queues' => $totalQueues,
            'waiting_queues' => $waitingQueues,
            'serving_queues' => $servingQueues,
            'completed_queues' => $completedQueues,
            'cancelled_queues' => $cancelledQueues,
            'active_counters' => $room->activeCounters->count(),
        ];
    }

    public function getActiveRoomsCount(): int
    {
        return Room::where('is_active', true)->count();
    }
}
