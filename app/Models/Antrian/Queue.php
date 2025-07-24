<?php

namespace App\Models\Antrian;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Queue extends Model
{
    use HasFactory;

    protected $table = 'queues';

    protected $fillable = [
        'room_id',
        'counter_id',
        'queue_number',
        'number_sequence',
        'status',
        'called_at',
        'served_at',
        'completed_at',
        'called_by',
        'notes',
        'queue_date'
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'served_at' => 'datetime',
        'completed_at' => 'datetime',
        'queue_date' => 'date'
    ];

    const STATUS_WAITING = 'waiting';
    const STATUS_CALLED = 'called';
    const STATUS_SERVING = 'serving';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the room that owns this queue
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the counter that owns this queue
     */
    public function counter(): BelongsTo
    {
        return $this->belongsTo(Counter::class);
    }

    /**
     * Get the user who called this queue
     */
    public function calledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'called_by');
    }

    /**
     * Call this queue
     */
    public function call(int $userId): bool
    {
        if ($this->status !== self::STATUS_WAITING) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_CALLED,
            'called_at' => now(),
            'called_by' => $userId
        ]);
    }

    /**
     * Start serving this queue
     */
    public function serve(): bool
    {
        if ($this->status !== self::STATUS_CALLED) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_SERVING,
            'served_at' => now()
        ]);
    }

    /**
     * Complete this queue
     */
    public function complete(string $notes = null): bool
    {
        if ($this->status !== self::STATUS_SERVING) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'notes' => $notes
        ]);
    }

    /**
     * Cancel this queue
     */
    public function cancel(string $notes = null): bool
    {
        if (in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED])) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $notes
        ]);
    }

    /**
     * Get estimated waiting time in minutes
     */
    public function getEstimatedWaitingTime(): int
    {
        $waitingQueues = static::where('counter_id', $this->counter_id)
            ->where('queue_date', $this->queue_date)
            ->where('number_sequence', '<', $this->number_sequence)
            ->where('status', self::STATUS_WAITING)
            ->count();

        return $waitingQueues * 5; // Assume 5 minutes per queue
    }

    /**
     * Scope for today's queues
     */
    public function scopeToday($query)
    {
        return $query->whereDate('queue_date', today());
    }

    /**
     * Scope for queues by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for waiting queues
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    /**
     * Scope for called queues
     */
    public function scopeCalled($query)
    {
        return $query->where('status', self::STATUS_CALLED);
    }

    /**
     * Scope for serving queues
     */
    public function scopeServing($query)
    {
        return $query->where('status', self::STATUS_SERVING);
    }

    /**
     * Get queue position in line
     */
    public function getPositionAttribute(): int
    {
        return static::where('counter_id', $this->counter_id)
            ->where('queue_date', $this->queue_date)
            ->where('number_sequence', '<', $this->number_sequence)
            ->where('status', self::STATUS_WAITING)
            ->count() + 1;
    }
}
