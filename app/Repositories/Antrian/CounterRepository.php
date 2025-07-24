<?php

namespace App\Repositories\Antrian;

use App\Models\Antrian\Counter;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CounterRepository implements CounterRepositoryInterface
{
    /**
     * Get all counters
     */
    public function getAll(): Collection
    {
        return Counter::with(['room'])->orderBy('name')->get();
    }

    /**
     * Get active counters
     */
    public function getActive(): Collection
    {
        return Counter::active()->with(['room'])->orderBy('name')->get();
    }

    /**
     * Get counters by room
     */
    public function getByRoom(int $roomId): Collection
    {
        return Counter::where('room_id', $roomId)->with(['room'])->orderBy('name')->get();
    }

    /**
     * Get active counters by room
     */
    public function getActiveByRoom(int $roomId): Collection
    {
        return Counter::where('room_id', $roomId)->active()->with(['room'])->orderBy('name')->get();
    }

    /**
     * Find counter by ID
     */
    public function findById(int $id): ?Counter
    {
        return Counter::with(['room'])->find($id);
    }

    /**
     * Find counter by code
     */
    public function findByCode(string $code): ?Counter
    {
        return Counter::where('code', $code)->with(['room'])->first();
    }

    /**
     * Create new counter
     */
    public function create(array $data): Counter
    {
        return Counter::create($data);
    }

    /**
     * Update counter
     */
    public function update(int $id, array $data): bool
    {
        return Counter::where('id', $id)->update($data);
    }

    /**
     * Delete counter
     */
    public function delete(int $id): bool
    {
        return Counter::destroy($id);
    }

    /**
     * Get counter statistics for today
     */
    public function getTodayStatistics(int $counterId): array
    {
        $counter = Counter::with(['todayQueues', 'room'])->find($counterId);

        if (!$counter) {
            return [
                'total_today' => 0,
                'completed_today' => 0,
                'average_service_time' => 0,
            ];
        }

        $todayQueues = $counter->todayQueues;
        $totalToday = $todayQueues->count();
        $completedToday = $todayQueues->where('status', 'completed')->count();
        
        // Calculate average service time for completed queues
        $completedQueuesWithTime = $todayQueues->where('status', 'completed')
            ->whereNotNull('served_at')
            ->whereNotNull('completed_at');
            
        $averageServiceTime = 0;
        if ($completedQueuesWithTime->count() > 0) {
            $totalServiceTime = $completedQueuesWithTime->sum(function ($queue) {
                return $queue->served_at->diffInMinutes($queue->completed_at);
            });
            $averageServiceTime = round($totalServiceTime / $completedQueuesWithTime->count(), 1);
        }

        return [
            'total_today' => $totalToday,
            'completed_today' => $completedToday,
            'average_service_time' => $averageServiceTime,
        ];
    }

    /**
     * Get counters by type
     */
    public function getByType(string $type): Collection
    {
        return Counter::byType($type)->with(['room'])->orderBy('name')->get();
    }

    /**
     * Get count of active counters
     */
    public function getActiveCountersCount(): int
    {
        return Counter::where('is_active', true)->count();
    }
}
