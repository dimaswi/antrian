<?php

namespace App\Repositories\Antrian;

use App\Models\Antrian\Queue;
use App\Models\Antrian\Counter;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QueueRepository implements QueueRepositoryInterface
{
    /**
     * Get all queues
     */
    public function getAll(): Collection
    {
        return Queue::with(['room', 'counter', 'calledBy'])->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get queues with pagination
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return Queue::with(['room', 'counter', 'calledBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get today's queues
     */
    public function getToday(): Collection
    {
        return Queue::today()->with(['room', 'counter', 'calledBy'])->orderBy('number_sequence')->get();
    }

    /**
     * Get queues by room
     */
    public function getByRoom(int $roomId, ?string $date = null): Collection
    {
        $query = Queue::where('room_id', $roomId)->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->orderBy('number_sequence')->get();
    }

    /**
     * Get queues by counter
     */
    public function getByCounter(int $counterId, ?string $date = null): Collection
    {
        $query = Queue::where('counter_id', $counterId)->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->orderBy('number_sequence')->get();
    }

    /**
     * Get queues by status
     */
    public function getByStatus(string $status, ?string $date = null): Collection
    {
        $query = Queue::byStatus($status)->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->orderBy('number_sequence')->get();
    }

    /**
     * Find queue by ID
     */
    public function findById(int $id): ?Queue
    {
        return Queue::with(['room', 'counter', 'calledBy'])->find($id);
    }

    /**
     * Find queue by number
     */
    public function findByNumber(string $queueNumber, ?string $date = null): ?Queue
    {
        $query = Queue::where('queue_number', $queueNumber)->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->first();
    }

    /**
     * Create new queue
     */
    public function create(array $data): Queue
    {
        // Generate next sequence number for the counter on the given date
        $lastSequence = Queue::where('counter_id', $data['counter_id'])
            ->whereDate('queue_date', $data['queue_date'] ?? today())
            ->max('number_sequence');

        $data['number_sequence'] = ($lastSequence ?? 0) + 1;

        // Generate queue number if not provided
        if (!isset($data['queue_number'])) {
            $counter = Counter::find($data['counter_id']);
            $data['queue_number'] = $counter->getNextQueueNumber();
        }

        return Queue::create($data);
    }

    /**
     * Update queue
     */
    public function update(int $id, array $data): bool
    {
        return Queue::where('id', $id)->update($data);
    }

    /**
     * Delete queue
     */
    public function delete(int $id): bool
    {
        return Queue::destroy($id);
    }

    /**
     * Get next queue number for counter
     */
    public function getNextQueueNumber(int $counterId): string
    {
        $counter = Counter::find($counterId);
        return $counter ? $counter->getNextQueueNumber() : '';
    }

    /**
     * Call next queue
     */
    public function callNext(int $counterId, int $userId): ?Queue
    {
        $nextQueue = Queue::where('counter_id', $counterId)
            ->today()
            ->waiting()
            ->orderBy('number_sequence')
            ->first();

        if ($nextQueue && $nextQueue->call($userId)) {
            return $nextQueue->fresh(['room', 'counter', 'calledBy']);
        }

        return null;
    }

    /**
     * Get waiting queues by counter
     */
    public function getWaitingByCounter(int $counterId, ?string $date = null): Collection
    {
        $query = Queue::where('counter_id', $counterId)
            ->waiting()
            ->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->orderBy('number_sequence')->get();
    }

    /**
     * Get served/completed queues by counter (for operator history)
     */
    public function getServedByCounter(int $counterId, ?string $date = null): Collection
    {
        $query = Queue::where('counter_id', $counterId)
            ->whereIn('status', [Queue::STATUS_CALLED, Queue::STATUS_SERVING, Queue::STATUS_COMPLETED, Queue::STATUS_CANCELLED])
            ->with(['room', 'counter', 'calledBy']);

        if ($date) {
            $query->whereDate('queue_date', $date);
        } else {
            $query->today();
        }

        return $query->orderBy('number_sequence', 'desc')->get();
    }

    /**
     * Get current serving queue by counter
     */
    public function getCurrentServingByCounter(int $counterId): ?Queue
    {
        return Queue::where('counter_id', $counterId)
            ->today()
            ->whereIn('status', [Queue::STATUS_CALLED, Queue::STATUS_SERVING])
            ->with(['room', 'counter', 'calledBy'])
            ->orderByRaw("CASE WHEN status = 'serving' THEN 1 ELSE 2 END")
            ->first();
    }

    /**
     * Get queue statistics for date range
     */
    public function getStatistics(?string $startDate = null, ?string $endDate = null): array
    {
        $query = Queue::query();

        if ($startDate) {
            $query->whereDate('queue_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('queue_date', '<=', $endDate);
        }

        if (!$startDate && !$endDate) {
            $query->today();
        }

        $queues = $query->get();

        return [
            'total_queues' => $queues->count(),
            'waiting_queues' => $queues->where('status', Queue::STATUS_WAITING)->count(),
            'called_queues' => $queues->where('status', Queue::STATUS_CALLED)->count(),
            'serving_queues' => $queues->where('status', Queue::STATUS_SERVING)->count(),
            'completed_queues' => $queues->where('status', Queue::STATUS_COMPLETED)->count(),
            'cancelled_queues' => $queues->where('status', Queue::STATUS_CANCELLED)->count(),
        ];
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStatistics(): array
    {
        $todayStats = $this->getStatistics();
        
        $roomStats = Queue::today()
            ->selectRaw('room_id, COUNT(*) as total, 
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as waiting,
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as serving,
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed', 
                         [Queue::STATUS_WAITING, Queue::STATUS_SERVING, Queue::STATUS_COMPLETED])
            ->groupBy('room_id')
            ->with('room')
            ->get();

        $counterStats = Queue::today()
            ->selectRaw('counter_id, COUNT(*) as total,
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as waiting,
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as serving,
                         SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed',
                         [Queue::STATUS_WAITING, Queue::STATUS_SERVING, Queue::STATUS_COMPLETED])
            ->groupBy('counter_id')
            ->with('counter')
            ->get();

        return [
            'today' => $todayStats,
            'by_room' => $roomStats,
            'by_counter' => $counterStats,
        ];
    }

    public function getTodayQueuesCount(): int
    {
        return Queue::today()->count();
    }

    public function getActiveQueuesCount(): int
    {
        return Queue::whereIn('status', [Queue::STATUS_WAITING, Queue::STATUS_SERVING])->count();
    }

    public function getCompletedTodayCount(): int
    {
        return Queue::today()->where('status', Queue::STATUS_COMPLETED)->count();
    }

    public function getAverageWaitingTime(\Carbon\Carbon $date): float
    {
        $completedQueues = Queue::whereDate('created_at', $date)
            ->where('status', Queue::STATUS_COMPLETED)
            ->whereNotNull('served_at')
            ->get();

        if ($completedQueues->isEmpty()) {
            return 0;
        }

        $totalWaitingMinutes = $completedQueues->sum(function ($queue) {
            return $queue->created_at->diffInMinutes($queue->served_at);
        });

        return $totalWaitingMinutes / $completedQueues->count();
    }
}
