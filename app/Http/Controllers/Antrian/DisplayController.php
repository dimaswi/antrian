<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Models\Antrian\Queue;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisplayController extends Controller
{
    public function __construct(
        private QueueRepositoryInterface $queueRepository,
        private RoomRepositoryInterface $roomRepository,
        private CounterRepositoryInterface $counterRepository
    ) {}

    /**
     * Display index page for selecting display type
     */
    public function index(): Response
    {
        $rooms = $this->roomRepository->getWithActiveCounters();
        $counters = $this->counterRepository->getActive();

        return Inertia::render('antrian/display/index', [
            'rooms' => $rooms,
            'counters' => $counters
        ]);
    }

    /**
     * Display universal queue display (all active rooms)
     */
    public function universal(): Response
    {
        $data = $this->getUniversalDisplayData();

        return Inertia::render('antrian/display/universal', [
            'data' => $data
        ]);
    }

    /**
     * Display universal queue display with glass UI
     */
    public function universalGlass(): Response
    {
        $data = $this->getUniversalDisplayData();

        return Inertia::render('antrian/display/universal-glass', [
            'data' => $data
        ]);
    }

    /**
     * API endpoint for universal display data
     */
    public function universalApi()
    {
        return response()->json($this->getUniversalDisplayData());
    }

    /**
     * Get universal display data
     */
    private function getUniversalDisplayData()
    {
        // Get current serving queues (called and serving)
        $currentServing = Queue::today()
            ->whereIn('status', ['called', 'serving'])
            ->with(['room', 'counter'])
            ->orderByRaw("CASE WHEN status = 'serving' THEN 1 ELSE 2 END")
            ->orderBy('called_at', 'asc')
            ->get();

        // Get waiting queues (ordered by creation time)
        $waitingQueues = Queue::today()
            ->where('status', 'waiting')
            ->with(['room', 'counter'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Get recent completed queues
        $recentCompleted = Queue::today()
            ->where('status', 'completed')
            ->with(['room', 'counter'])
            ->orderBy('completed_at', 'desc')
            ->take(12)
            ->get();

        // Calculate statistics
        $statistics = [
            'total_waiting' => $waitingQueues->count(),
            'total_serving' => $currentServing->where('status', 'serving')->count(),
            'total_called' => $currentServing->where('status', 'called')->count(),
            'total_completed_today' => Queue::today()
                ->where('status', 'completed')
                ->count(),
        ];

        return [
            'current_serving' => $currentServing,
            'waiting_queues' => $waitingQueues,
            'recent_completed' => $recentCompleted,
            'statistics' => $statistics,
        ];
    }

    /**
     * Display queue for specific room
     */
    public function room(int $roomId): Response
    {
        $room = $this->roomRepository->findById($roomId);
        
        if (!$room) {
            abort(404);
        }

        $counters = $this->counterRepository->getActiveByRoom($roomId);

        // Get queue information for each counter
        foreach ($counters as $counter) {
            $currentServing = $this->queueRepository->getCurrentServingByCounter($counter->id);
            $waitingQueues = $this->queueRepository->getWaitingByCounter($counter->id);
            
            $counter->current_serving = $currentServing;
            $counter->waiting_count = $waitingQueues->count();
            $counter->waiting_queues = $waitingQueues->take(5); // Show next 5 queues
        }

        return Inertia::render('antrian/display/room', [
            'room' => $room,
            'counters' => $counters,
            'refresh_interval' => 3000 // 3 seconds
        ]);
    }

    /**
     * Display queue for specific room with glass UI
     */
    public function roomGlass(int $roomId): Response
    {
        $room = $this->roomRepository->findById($roomId);
        
        if (!$room) {
            abort(404);
        }

        $counters = $this->counterRepository->getActiveByRoom($roomId);

        // Get queue information for each counter
        foreach ($counters as $counter) {
            $currentServing = $this->queueRepository->getCurrentServingByCounter($counter->id);
            $waitingQueues = $this->queueRepository->getWaitingByCounter($counter->id);
            
            $counter->current_serving = $currentServing;
            $counter->waiting_count = $waitingQueues->count();
            $counter->waiting_queues = $waitingQueues->take(5); // Show next 5 queues
        }

        return Inertia::render('antrian/display/room-glass', [
            'room' => $room,
            'counters' => $counters,
            'refresh_interval' => 3000 // 3 seconds
        ]);
    }

    /**
     * Display queue for specific counter
     */
    public function counter(int $counterId): Response
    {
        $counter = $this->counterRepository->findById($counterId);
        
        if (!$counter) {
            abort(404);
        }

        $currentServing = $this->queueRepository->getCurrentServingByCounter($counterId);
        $waitingQueues = $this->queueRepository->getWaitingByCounter($counterId);

        // Add queue information to counter object
        $counter->current_serving = $currentServing;
        $counter->waiting_count = $waitingQueues->count();
        $counter->waiting_queues = $waitingQueues->take(10);

        return Inertia::render('antrian/display/counter', [
            'counter' => $counter,
            'refresh_interval' => 2000 // 2 seconds
        ]);
    }

    /**
     * Display queue for specific counter with glass UI
     */
    public function counterGlass(int $counterId): Response
    {
        $counter = $this->counterRepository->findById($counterId);
        
        if (!$counter) {
            abort(404);
        }

        $currentServing = $this->queueRepository->getCurrentServingByCounter($counterId);
        $waitingQueues = $this->queueRepository->getWaitingByCounter($counterId);

        // Add queue information to counter object
        $counter->current_serving = $currentServing;
        $counter->waiting_count = $waitingQueues->count();
        $counter->waiting_queues = $waitingQueues->take(10);

        return Inertia::render('antrian/display/counter-glass', [
            'counter' => $counter,
            'refresh_interval' => 2000 // 2 seconds
        ]);
    }

    /**
     * API endpoint for room display updates
     */
    public function apiRoom(int $roomId)
    {
        $counters = $this->counterRepository->getActiveByRoom($roomId);

        foreach ($counters as $counter) {
            $currentServing = $this->queueRepository->getCurrentServingByCounter($counter->id);
            $waitingQueues = $this->queueRepository->getWaitingByCounter($counter->id);
            
            $counter->current_serving = $currentServing;
            $counter->waiting_count = $waitingQueues->count();
            $counter->waiting_queues = $waitingQueues->take(5);
        }

        return response()->json([
            'success' => true,
            'data' => $counters,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * API endpoint for counter display updates
     */
    public function apiCounter(int $counterId)
    {
        $currentServing = $this->queueRepository->getCurrentServingByCounter($counterId);
        $waitingQueues = $this->queueRepository->getWaitingByCounter($counterId);

        return response()->json([
            'success' => true,
            'data' => [
                'current_serving' => $currentServing,
                'waiting_queues' => $waitingQueues->take(10),
                'waiting_count' => $waitingQueues->count()
            ],
            'timestamp' => now()->toISOString()
        ]);
    }
}
