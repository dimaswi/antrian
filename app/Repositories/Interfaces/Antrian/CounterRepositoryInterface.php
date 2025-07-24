<?php

namespace App\Repositories\Interfaces\Antrian;

use App\Models\Antrian\Counter;
use Illuminate\Database\Eloquent\Collection;

interface CounterRepositoryInterface
{
    /**
     * Get all counters
     */
    public function getAll(): Collection;

    /**
     * Get active counters
     */
    public function getActive(): Collection;

    /**
     * Get counters by room
     */
    public function getByRoom(int $roomId): Collection;

    /**
     * Get active counters by room
     */
    public function getActiveByRoom(int $roomId): Collection;

    /**
     * Find counter by ID
     */
    public function findById(int $id): ?Counter;

    /**
     * Find counter by code
     */
    public function findByCode(string $code): ?Counter;

    /**
     * Create new counter
     */
    public function create(array $data): Counter;

    /**
     * Update counter
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete counter
     */
    public function delete(int $id): bool;

    /**
     * Get counter statistics for today
     */
    public function getTodayStatistics(int $counterId): array;

    /**
     * Get counters by type
     */
    public function getByType(string $type): Collection;

    /**
     * Get count of active counters
     */
    public function getActiveCountersCount(): int;
}
