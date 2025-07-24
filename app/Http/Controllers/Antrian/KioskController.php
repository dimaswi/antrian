<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KioskController extends Controller
{
    public function __construct(
        private QueueRepositoryInterface $queueRepository,
        private RoomRepositoryInterface $roomRepository,
        private CounterRepositoryInterface $counterRepository
    ) {}

    /**
     * Display kiosk main page for room and counter selection
     */
    public function index(): Response
    {
        $rooms = $this->roomRepository->getWithActiveCounters();

        // Add statistics for each room
        foreach ($rooms as $room) {
            $room->counters_count = $room->activeCounters->count();
            
            // Calculate total waiting queues and estimated wait time for the room
            $totalWaiting = 0;
            $totalEstimatedTime = 0;
            
            foreach ($room->activeCounters as $counter) {
                $waitingCount = $this->queueRepository->getWaitingByCounter($counter->id)->count();
                $totalWaiting += $waitingCount;
                $totalEstimatedTime += $waitingCount * 5; // 5 minutes per queue
            }
            
            $room->waiting_queues_count = $totalWaiting;
            $room->estimated_wait_time = $room->activeCounters->count() > 0 
                ? round($totalEstimatedTime / $room->activeCounters->count()) 
                : 0;
        }

        return Inertia::render('antrian/kiosk/index', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Display room selection page
     */
    public function selectRoom(): Response
    {
        $rooms = $this->roomRepository->getActive();

        return Inertia::render('antrian/kiosk/select-room', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Display counter selection page for specific room
     */
    public function selectCounter(int $roomId): Response
    {
        $room = $this->roomRepository->findById($roomId);
        
        if (!$room) {
            abort(404);
        }

        $counters = $this->counterRepository->getActiveByRoom($roomId);

        // Add waiting queue information for each counter
        foreach ($counters as $counter) {
            $waitingCount = $this->queueRepository->getWaitingByCounter($counter->id)->count();
            $counter->waiting_queues_count = $waitingCount;
            
            // Calculate estimated waiting time (5 minutes per queue)
            $counter->estimated_waiting_time = $waitingCount * 5;
            
            // Add current serving queue information
            $currentServing = $this->queueRepository->getCurrentServingByCounter($counter->id);
            $counter->current_serving = $currentServing ? [
                'queue_number' => $currentServing->queue_number
            ] : null;
            
            // Ensure type is set (default to 'general' if not specified)
            if (!isset($counter->type) || empty($counter->type)) {
                $counter->type = 'general';
            }
        }

        return Inertia::render('antrian/kiosk/select-counter', [
            'room' => $room,
            'counters' => $counters
        ]);
    }

    /**
     * Generate queue ticket
     */
    public function generateTicket(Request $request)
    {
        $validated = $request->validate([
            'counter_id' => 'required|exists:counters,id',
            'room_id' => 'nullable|exists:rooms,id'
        ]);

        // Prevent duplicate submissions within 5 seconds
        $sessionKey = 'last_ticket_request_' . $validated['counter_id'];
        $lastRequest = session($sessionKey);
        
        if ($lastRequest && now()->diffInSeconds($lastRequest) < 5) {
            return redirect()->back()
                ->withErrors(['error' => 'Permintaan terlalu cepat. Silakan tunggu beberapa detik.']);
        }

        session([$sessionKey => now()]);

        try {
            // Get the counter to extract room_id
            $counter = $this->counterRepository->findById($validated['counter_id']);
            
            if (!$counter) {
                throw new \Exception('Counter not found');
            }

            // Check if counter is active
            if (!$counter->is_active) {
                throw new \Exception('Loket sedang tidak aktif');
            }

            $queue = $this->queueRepository->create([
                'counter_id' => $validated['counter_id'],
                'room_id' => $counter->room_id, // Get room_id from the counter
                'queue_date' => today()
            ]);

            $queue->load(['room', 'counter']);

            // Clear the session key after successful creation
            session()->forget($sessionKey);

            // Redirect to ticket page with success message
            return redirect()->route('antrian.kiosk.ticket', $queue->id)
                ->with('success', 'Tiket antrian berhasil dibuat');

        } catch (\Exception $e) {
            // Clear the session key on error so user can retry
            session()->forget($sessionKey);
            
            // Redirect back with error message
            return redirect()->back()
                ->withErrors(['error' => 'Gagal membuat tiket antrian: ' . $e->getMessage()]);
        }
    }

    /**
     * Display ticket confirmation page
     */
    public function ticket(int $queueId): Response
    {
        $queue = $this->queueRepository->findById($queueId);
        
        if (!$queue) {
            abort(404);
        }

        // Calculate current position and waiting time
        $waitingQueues = $this->queueRepository->getWaitingByCounter($queue->counter_id);
        $position = $waitingQueues->where('number_sequence', '<', $queue->number_sequence)->count() + 1;
        $estimatedWaitTime = ($position - 1) * 5;

        return Inertia::render('antrian/kiosk/ticket', [
            'queue' => $queue,
            'position' => $position,
            'estimated_wait_time' => $estimatedWaitTime
        ]);
    }

    /**
     * Check queue status API
     */
    public function checkStatus(Request $request)
    {
        $validated = $request->validate([
            'queue_number' => 'required|string',
            'queue_date' => 'nullable|date'
        ]);

        $queueDate = $validated['queue_date'] ?? today()->format('Y-m-d');
        
        $queue = $this->queueRepository->findByNumber($validated['queue_number'], $queueDate);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        // Calculate current position if still waiting
        $position = null;
        $estimatedWaitTime = null;
        
        if ($queue->status === 'waiting') {
            $waitingQueues = $this->queueRepository->getWaitingByCounter($queue->counter_id);
            $position = $waitingQueues->where('number_sequence', '<', $queue->number_sequence)->count() + 1;
            $estimatedWaitTime = ($position - 1) * 5;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'queue' => $queue->load(['room', 'counter']),
                'position' => $position,
                'estimated_wait_time' => $estimatedWaitTime
            ]
        ]);
    }

    /**
     * Get room statistics for kiosk display
     */
    public function roomStatistics(int $roomId)
    {
        $statistics = $this->roomRepository->getTodayStatistics($roomId);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Get counter statistics for kiosk display
     */
    public function counterStatistics(int $counterId)
    {
        $statistics = $this->counterRepository->getTodayStatistics($counterId);
        
        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }
}
