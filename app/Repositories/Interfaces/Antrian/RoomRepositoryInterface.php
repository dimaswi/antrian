<?php

namespace App\Repositories\Interfaces\Antrian;

use App\Models\Antrian\Room;
use Illuminate\Database\Eloquent\Collection;

interface RoomRepositoryInterface
{
    /**
     * Get all rooms
     */
    public function getAll(): Collection;

    /**
     * Get active rooms
     */
    public function getActive(): Collection;

    /**
     * Find room by ID
     */
    public function findById(int $id): ?Room;

    /**
     * Find room by code
     */
    public function findByCode(string $code): ?Room;

    /**
     * Create new room
     */
    public function create(array $data): Room;

    /**
     * Update room
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete room
     */
    public function delete(int $id): bool;

    /**
     * Get rooms with counters
     */
    public function getWithCounters(): Collection;

    /**
     * Get rooms with active counters
     */
    public function getWithActiveCounters(): Collection;

    /**
     * Get room statistics for today
     */
    public function getTodayStatistics(int $roomId): array;

    /**
     * Get count of active rooms
     */
    public function getActiveRoomsCount(): int;
}
