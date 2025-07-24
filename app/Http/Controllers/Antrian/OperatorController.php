<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OperatorController extends Controller
{
    public function __construct(
        private QueueRepositoryInterface $queueRepository,
        private CounterRepositoryInterface $counterRepository
    ) {}

    /**
     * Display operator dashboard
     */
    public function index(Request $request): Response
    {
        $counterId = $request->get('counter_id') ?? $request->get('counter');
        $counters = $this->counterRepository->getActive();

        $selectedCounter = null;
        $currentServing = null;
        $waitingQueues = collect();
        $statistics = [];

        if ($counterId) {
            $selectedCounter = $this->counterRepository->findById($counterId);
            if ($selectedCounter) {
                $currentServing = $this->queueRepository->getCurrentServingByCounter($counterId);
                $waitingQueues = $this->queueRepository->getWaitingByCounter($counterId);
                $statistics = $this->counterRepository->getTodayStatistics($counterId);
            }
        }

        return Inertia::render('antrian/operator/index', [
            'counters' => $counters,
            'selectedCounterId' => $counterId ? (int) $counterId : null,
            'selected_counter' => $selectedCounter,
            'current_serving' => $currentServing,
            'waiting_queues' => $waitingQueues->take(10),
            'statistics' => $statistics
        ]);
    }

    /**
     * Display compact operator dashboard
     */
    public function compact(Request $request): Response
    {
        $counterId = $request->get('counter_id') ?? $request->get('counter');
        $counters = $this->counterRepository->getActive();

        return Inertia::render('antrian/operator/compact', [
            'counters' => $counters,
            'selectedCounterId' => $counterId ? (int) $counterId : null,
        ]);
    }

    /**
     * Call next queue
     */
    public function callNext(Request $request)
    {
        $validated = $request->validate([
            'counter_id' => 'required|exists:counters,id'
        ]);

        $queue = $this->queueRepository->callNext($validated['counter_id'], Auth::id());

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'No waiting queue found'
            ], 404);
        }

        // Log the call action with detailed info for audio debugging
        Log::info('Queue called for audio announcement', [
            'queue_id' => $queue->id,
            'queue_number' => $queue->queue_number,
            'counter_id' => $queue->counter_id,
            'operator_id' => Auth::id(),
            'called_at' => $queue->called_at,
            'audio_key' => $queue->id . '-' . $queue->called_at,
            'action' => 'call_next'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Queue called successfully',
            'data' => $queue,
            'audio_trigger' => true, // Flag to indicate this should trigger audio
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Start serving current queue
     */
    public function startServing(int $queueId)
    {
        $queue = $this->queueRepository->findById($queueId);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if ($queue->status !== 'called') {
            return response()->json([
                'success' => false,
                'message' => 'Queue must be called first'
            ], 400);
        }

        if (!$queue->serve()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start serving'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Started serving queue',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Complete current queue
     */
    public function completeQueue(Request $request, int $queueId)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        $queue = $this->queueRepository->findById($queueId);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if ($queue->status !== 'serving') {
            return response()->json([
                'success' => false,
                'message' => 'Queue must be in serving status'
            ], 400);
        }

        if (!$queue->complete($validated['notes'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete queue'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue completed successfully',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Skip current queue (move to cancelled)
     */
    public function skipQueue(Request $request, int $queueId)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        $queue = $this->queueRepository->findById($queueId);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if (!in_array($queue->status, ['called', 'serving'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot skip this queue'
            ], 400);
        }

        if (!$queue->cancel($validated['reason'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to skip queue'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue skipped successfully',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Re-call queue (for missed calls)
     */
    public function recallQueue(int $queueId)
    {
        $queue = $this->queueRepository->findById($queueId);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if ($queue->status !== 'called') {
            return response()->json([
                'success' => false,
                'message' => 'Only called queues can be recalled. Current status: ' . $queue->status
            ], 400);
        }

        // Check if queue was called recently (within 5 minutes) to prevent spam
        // if ($queue->called_at && $queue->called_at->diffInMinutes(now()) < 1) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Queue was called recently. Please wait before recalling.'
        //     ], 429);
        // }

        try {
            // Update called_at timestamp for re-announcement
            $queue->update([
                'called_at' => now(),
                'called_by' => Auth::id()
            ]);

            // Refresh the queue to get updated timestamp
            $queue = $queue->fresh(['room', 'counter', 'calledBy']);

            // Log the recall action with detailed info for audio debugging
            Log::info('Queue recalled for audio announcement', [
                'queue_id' => $queue->id,
                'queue_number' => $queue->queue_number,
                'counter_id' => $queue->counter_id,
                'operator_id' => Auth::id(),
                'recalled_at' => now(),
                'called_at' => $queue->called_at,
                'audio_key' => $queue->id . '-' . $queue->called_at,
                'action' => 'recall'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Queue recalled successfully',
                'data' => $queue,
                'audio_trigger' => true, // Flag to indicate this should trigger audio
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to recall queue', [
                'queue_id' => $queueId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to recall queue'
            ], 500);
        }
    }

    /**
     * Get counter queue status for real-time updates
     */
    public function getCounterStatus(int $counterId)
    {
        $counter = $this->counterRepository->findById($counterId);
        
        if (!$counter) {
            return response()->json([
                'success' => false,
                'message' => 'Counter not found'
            ], 404);
        }

        $currentServing = $this->queueRepository->getCurrentServingByCounter($counterId);
        $waitingQueues = $this->queueRepository->getWaitingByCounter($counterId);
        $servedQueues = $this->queueRepository->getServedByCounter($counterId);
        $statistics = $this->counterRepository->getTodayStatistics($counterId);

        return response()->json([
            'success' => true,
            'counter' => $counter,
            'current_serving' => $currentServing,
            'next_waiting' => $waitingQueues->first(),
            'waiting_queues' => $waitingQueues->take(10)->values(),
            'served_queues' => $servedQueues->take(20)->values(), // Add served queues for history
            'waiting_count' => $waitingQueues->count(),
            'statistics' => $statistics,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get operator activity history
     */
    public function getActivity(Request $request)
    {
        $date = $request->get('date', today()->format('Y-m-d'));
        $counterId = $request->get('counter_id');

        $query = $this->queueRepository->getToday()
            ->where('called_by', Auth::id());

        if ($counterId) {
            $query = $query->where('counter_id', $counterId);
        }

        if ($date !== today()->format('Y-m-d')) {
            $query = $this->queueRepository->getAll()
                ->where('called_by', Auth::id())
                ->filter(function ($queue) use ($date) {
                    return $queue->queue_date->format('Y-m-d') === $date;
                });
        }

        $activities = $query->sortByDesc('called_at')->take(20);

        return response()->json([
            'success' => true,
            'data' => $activities->values()
        ]);
    }

    /**
     * Get recall history for monitoring
     */
    public function getRecallHistory(Request $request)
    {
        $counterId = $request->get('counter_id');
        $date = $request->get('date', today()->format('Y-m-d'));

        $query = $this->queueRepository->getAll()
            ->where('status', 'called')
            ->where('called_by', Auth::id());

        if ($counterId) {
            $query = $query->where('counter_id', $counterId);
        }

        if ($date) {
            $query = $query->filter(function ($queue) use ($date) {
                return $queue->queue_date->format('Y-m-d') === $date;
            });
        }

        // Get queues that have been recalled (called_at updated after creation)
        $recalls = $query->filter(function ($queue) {
            return $queue->called_at && $queue->called_at->gt($queue->created_at->addMinutes(5));
        })->sortByDesc('called_at')->take(10);

        return response()->json([
            'success' => true,
            'data' => $recalls->values(),
            'total_recalls_today' => $recalls->count()
        ]);
    }

    /**
     * Create test data for development
     */
    public function createTestData()
    {
        if (app()->environment('production')) {
            abort(403, 'Not allowed in production');
        }

        $counter = $this->counterRepository->getActive()->first();
        if (!$counter) {
            return response()->json(['error' => 'No active counter found']);
        }

        $queues = [];
        for ($i = 1; $i <= 5; $i++) {
            $queue = \App\Models\Antrian\Queue::create([
                'queue_number' => $counter->room->prefix . str_pad($i, 3, '0', STR_PAD_LEFT),
                'room_id' => $counter->room_id,
                'counter_id' => $counter->id,
                'status' => 'waiting',
                'queue_date' => today(),
                'number_sequence' => $i,
                'patient_name' => 'Test Patient ' . $i,
            ]);
            $queues[] = $queue;
        }

        return response()->json([
            'success' => true,
            'message' => 'Test data created successfully',
            'queues' => $queues
        ]);
    }
}
