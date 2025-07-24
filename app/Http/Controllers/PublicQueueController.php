<?php

namespace App\Http\Controllers;

use App\Models\Antrian\Queue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicQueueController extends Controller
{
    /**
     * Show queue status page
     */
    public function show(string $queueNumber): Response
    {
        // Find queue by queue_number
        $queue = Queue::with(['room', 'counter', 'calledBy'])
            ->where('queue_number', $queueNumber)
            ->whereDate('queue_date', today())
            ->first();

        if (!$queue) {
            return Inertia::render('public/queue-not-found', [
                'queue_number' => $queueNumber
            ]);
        }

        // Get current position in queue
        $position = null;
        if ($queue->status === 'waiting') {
            $position = Queue::where('counter_id', $queue->counter_id)
                ->where('status', 'waiting')
                ->where('number_sequence', '<', $queue->number_sequence)
                ->whereDate('queue_date', today())
                ->count() + 1;
        }

        // Get currently serving queue for this counter
        $currentServing = Queue::where('counter_id', $queue->counter_id)
            ->whereIn('status', ['called', 'serving'])
            ->whereDate('queue_date', today())
            ->with(['calledBy'])
            ->first();

        // Get estimated wait time (rough calculation)
        $estimatedWaitTime = null;
        if ($queue->status === 'waiting' && $position) {
            // Assume 5 minutes per queue on average
            $estimatedWaitTime = $position * 5;
        }

        return Inertia::render('public/queue-status', [
            'queue' => $queue,
            'position' => $position,
            'current_serving' => $currentServing,
            'estimated_wait_time' => $estimatedWaitTime,
        ]);
    }

    /**
     * API endpoint for queue status (for real-time updates)
     */
    public function status(string $queueNumber)
    {
        $queue = Queue::with(['room', 'counter', 'calledBy'])
            ->where('queue_number', $queueNumber)
            ->whereDate('queue_date', today())
            ->first();

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Antrian tidak ditemukan'
            ], 404);
        }

        // Get current position in queue
        $position = null;
        if ($queue->status === 'waiting') {
            $position = Queue::where('counter_id', $queue->counter_id)
                ->where('status', 'waiting')
                ->where('number_sequence', '<', $queue->number_sequence)
                ->whereDate('queue_date', today())
                ->count() + 1;
        }

        // Get currently serving queue for this counter
        $currentServing = Queue::where('counter_id', $queue->counter_id)
            ->whereIn('status', ['called', 'serving'])
            ->whereDate('queue_date', today())
            ->with(['calledBy'])
            ->first();

        // Get estimated wait time
        $estimatedWaitTime = null;
        if ($queue->status === 'waiting' && $position) {
            $estimatedWaitTime = $position * 5;
        }

        return response()->json([
            'success' => true,
            'queue' => $queue,
            'position' => $position,
            'current_serving' => $currentServing,
            'estimated_wait_time' => $estimatedWaitTime,
            'timestamp' => now()->toISOString()
        ]);
    }
}
