<?php

namespace App\Models\Antrian;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Counter extends Model
{
    use HasFactory;

    protected $table = 'counters';

    protected $fillable = [
        'room_id',
        'name',
        'code',
        'description',
        'is_active',
        'current_queue_number',
        'type'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'current_queue_number' => 'integer'
    ];

    /**
     * Get the room that owns this counter
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get all queues for this counter
     */
    public function queues(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    /**
     * Get today's queues for this counter
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
     * Get current serving queue
     */
    public function getCurrentServingQueue()
    {
        return $this->todayQueues()->where('status', 'serving')->first();
    }

    /**
     * Get next waiting queue
     */
    public function getNextWaitingQueue()
    {
        return $this->todayQueues()->where('status', 'waiting')->orderBy('number_sequence')->first();
    }

    /**
     * Get next queue number for this counter
     */
    public function getNextQueueNumber(): string
    {
        // Get the next sequence number for today
        $nextSequence = \App\Models\Antrian\Queue::where('counter_id', $this->id)
            ->whereDate('queue_date', today())
            ->max('number_sequence');
        
        $nextSequence = ($nextSequence ?? 0) + 1;
        
        $roomPrefix = $this->room->prefix ?? 'R';
        return $roomPrefix . $this->id . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Reset daily queue number (should be called daily)
     */
    public function resetDailyQueue(): void
    {
        $this->update(['current_queue_number' => 0]);
    }

    /**
     * Scope for active counters
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for counters by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
