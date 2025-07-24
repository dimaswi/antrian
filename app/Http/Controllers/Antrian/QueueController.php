<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Models\Antrian\Queue;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class QueueController extends Controller
{
    public function __construct(
        private QueueRepositoryInterface $queueRepository,
        private CounterRepositoryInterface $counterRepository,
        private RoomRepositoryInterface $roomRepository
    ) {}

    /**
     * Display a listing of queues
     */
    public function index(Request $request): Response
    {
        $date = $request->get('date', today()->format('Y-m-d'));
        $roomId = $request->get('room_id');
        $counterId = $request->get('counter_id');
        $search = $request->get('search');
        $status = $request->get('status');
        $perPage = $request->get('per_page', 10);

        // Start with base query
        $query = Queue::with(['room', 'counter'])
            ->whereDate('queue_date', $date)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($counterId) {
            $query->where('counter_id', $counterId);
        } elseif ($roomId) {
            $query->where('room_id', $roomId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('queue_number', 'LIKE', "%{$search}%")
                  ->orWhere('patient_name', 'LIKE', "%{$search}%");
            });
        }

        // Get paginated results
        $queues = $query->paginate($perPage);

        // Get additional data for filters
        $rooms = $this->roomRepository->getActive();
        $counters = $this->counterRepository->getActive();

        // Get basic statistics using existing methods
        $statistics = [
            'total_queues' => Queue::whereDate('queue_date', $date)->count(),
            'waiting_queues' => Queue::whereDate('queue_date', $date)->where('status', 'waiting')->count(),
            'serving_queues' => Queue::whereDate('queue_date', $date)->where('status', 'serving')->count(),
            'completed_queues' => Queue::whereDate('queue_date', $date)->where('status', 'completed')->count(),
            'cancelled_queues' => Queue::whereDate('queue_date', $date)->where('status', 'cancelled')->count(),
            'average_waiting_time' => 0, // Can be calculated later if needed
        ];

        return Inertia::render('antrian/queue/index', [
            'queues' => $queues,
            'statistics' => $statistics,
            'rooms' => $rooms,
            'counters' => $counters,
            'filters' => [
                'date' => $date,
                'room_id' => $roomId,
                'counter_id' => $counterId,
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Display the specified queue
     */
    public function show(int $id): Response
    {
        $queue = $this->queueRepository->findById($id);

        if (!$queue) {
            abort(404, 'Queue not found');
        }

        // Load relationships
        $queue->load(['room', 'counter', 'calledBy']);

        // Get today's statistics for this room/counter
        $todayStatistics = [
            'total_queues' => Queue::whereDate('queue_date', $queue->queue_date)
                ->where('room_id', $queue->room_id)
                ->count(),
            'waiting_queues' => Queue::whereDate('queue_date', $queue->queue_date)
                ->where('room_id', $queue->room_id)
                ->where('status', 'waiting')
                ->count(),
            'serving_queues' => Queue::whereDate('queue_date', $queue->queue_date)
                ->where('room_id', $queue->room_id)
                ->where('status', 'serving')
                ->count(),
            'completed_queues' => Queue::whereDate('queue_date', $queue->queue_date)
                ->where('room_id', $queue->room_id)
                ->where('status', 'completed')
                ->count(),
        ];

        // Get queue position if still waiting
        $queuePosition = null;
        if ($queue->status === 'waiting') {
            // Get all waiting queues for the same counter, ordered by creation time
            $waitingQueues = Queue::where('counter_id', $queue->counter_id)
                ->whereDate('queue_date', $queue->queue_date)
                ->where('status', 'waiting')
                ->orderBy('created_at', 'asc')
                ->pluck('id')
                ->toArray();
            
            // Find the position of current queue in the waiting list
            $position = array_search($queue->id, $waitingQueues);
            $queuePosition = $position !== false ? $position + 1 : null;
        }

        return Inertia::render('antrian/queue/show', [
            'queue' => $queue,
            'statistics' => $todayStatistics,
            'queuePosition' => $queuePosition
        ]);
    }

    /**
     * Store a newly created queue
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'counter_id' => 'required|exists:counters,id',
            'queue_date' => 'nullable|date'
        ]);

        $validated['queue_date'] = $validated['queue_date'] ?? today();

        $queue = $this->queueRepository->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Queue created successfully',
            'data' => $queue->load(['room', 'counter'])
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

        return response()->json([
            'success' => true,
            'message' => 'Queue called successfully',
            'data' => $queue
        ]);
    }

    /**
     * Start serving queue
     */
    public function serve(int $id)
    {
        $queue = $this->queueRepository->findById($id);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if (!$queue->serve()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot serve this queue'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue serving started',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Complete queue
     */
    public function complete(Request $request, int $id)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $queue = $this->queueRepository->findById($id);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if (!$queue->complete($validated['notes'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot complete this queue'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue completed successfully',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Cancel queue
     */
    public function cancel(Request $request, int $id)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $queue = $this->queueRepository->findById($id);

        if (!$queue) {
            return response()->json([
                'success' => false,
                'message' => 'Queue not found'
            ], 404);
        }

        if (!$queue->cancel($validated['notes'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this queue'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue cancelled successfully',
            'data' => $queue->fresh(['room', 'counter', 'calledBy'])
        ]);
    }

    /**
     * Get queue statistics
     */
    public function statistics(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $statistics = $this->queueRepository->getStatistics($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard(): Response
    {
        $statistics = $this->queueRepository->getDashboardStatistics();

        return Inertia::render('Antrian/Dashboard', [
            'statistics' => $statistics
        ]);
    }
}
