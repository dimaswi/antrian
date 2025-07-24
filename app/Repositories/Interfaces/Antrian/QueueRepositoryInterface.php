<?php

namespace App\Repositories\Interfaces\Antrian;

use App\Models\Antrian\Queue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface QueueRepositoryInterface
{
    /**
     * Get all queues
     */
    public function getAll(): Collection;

    /**
     * Get queues with pagination
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator;

    /**
     * Get today's queues
     */
    public function getToday(): Collection;

    /**
     * Get queues by room
     */
    public function getByRoom(int $roomId, ?string $date = null): Collection;

    /**
     * Get queues by counter
     */
    public function getByCounter(int $counterId, ?string $date = null): Collection;

    /**
     * Get queues by status
     */
    public function getByStatus(string $status, ?string $date = null): Collection;

    /**
     * Find queue by ID
     */
    public function findById(int $id): ?Queue;

    /**
     * Find queue by number
     */
    public function findByNumber(string $queueNumber, ?string $date = null): ?Queue;

    /**
     * Create new queue
     */
    public function create(array $data): Queue;

    /**
     * Update queue
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete queue
     */
    public function delete(int $id): bool;

    /**
     * Get next queue number for counter
     */
    public function getNextQueueNumber(int $counterId): string;

    /**
     * Call next queue
     */
    public function callNext(int $counterId, int $userId): ?Queue;

    /**
     * Get waiting queues by counter
     */
    public function getWaitingByCounter(int $counterId, ?string $date = null): Collection;

    /**
     * Get served/completed queues by counter (for operator history)
     */
    public function getServedByCounter(int $counterId, ?string $date = null): Collection;

    /**
     * Get current serving queue by counter
     */
    public function getCurrentServingByCounter(int $counterId): ?Queue;

    /**
     * Get queue statistics for date range
     */
    public function getStatistics(?string $startDate = null, ?string $endDate = null): array;

    /**
     * Get dashboard statistics
     */
    public function getDashboardStatistics(): array;

    /**
     * Get count of today's queues
     */
    public function getTodayQueuesCount(): int;

    /**
     * Get count of active queues
     */
    public function getActiveQueuesCount(): int;

    /**
     * Get count of completed queues today
     */
    public function getCompletedTodayCount(): int;

    /**
     * Get average waiting time for a specific date
     */
    public function getAverageWaitingTime(\Carbon\Carbon $date): float;
}
