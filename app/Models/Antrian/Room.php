<?php

namespace App\Models\Antrian;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $table = 'rooms';

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'current_queue_number',
        'prefix'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'current_queue_number' => 'integer'
    ];

    /**
     * Get all counters for this room
     */
    public function counters(): HasMany
    {
        return $this->hasMany(Counter::class);
    }

    /**
     * Get active counters for this room
     */
    public function activeCounters(): HasMany
    {
        return $this->hasMany(Counter::class)->where('is_active', true);
    }

    /**
     * Get all queues for this room
     */
    public function queues(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    /**
     * Get today's queues for this room
     */
    public function todayQueues(): HasMany
    {
        return $this->hasMany(Queue::class)->whereDate('queue_date', today());
    }

    /**
     * Get waiting queues count for today
     */
    public function getWaitingQueuesCountAttribute(): int
    {
        return $this->todayQueues()->where('status', 'waiting')->count();
    }

    /**
     * Get next queue number for this room
     */
    public function getNextQueueNumber(): string
    {
        $this->increment('current_queue_number');
        return $this->prefix . str_pad($this->current_queue_number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Reset daily queue number (should be called daily)
     */
    public function resetDailyQueue(): void
    {
        $this->update(['current_queue_number' => 0]);
    }

    /**
     * Scope for active rooms
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
