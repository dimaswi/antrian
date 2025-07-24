<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    protected $roomRepository;
    protected $counterRepository;
    protected $queueRepository;

    public function __construct(
        RoomRepositoryInterface $roomRepository,
        CounterRepositoryInterface $counterRepository,
        QueueRepositoryInterface $queueRepository
    ) {
        $this->roomRepository = $roomRepository;
        $this->counterRepository = $counterRepository;
        $this->queueRepository = $queueRepository;
    }

    /**
     * Display the antrian dashboard
     */
    public function index()
    {
        $today = Carbon::today();
        
        // Get statistics
        $stats = [
            'total_rooms' => $this->roomRepository->getActiveRoomsCount(),
            'total_counters' => $this->counterRepository->getActiveCountersCount(),
            'total_queues_today' => $this->queueRepository->getTodayQueuesCount(),
            'active_queues' => $this->queueRepository->getActiveQueuesCount(),
            'completed_queues_today' => $this->queueRepository->getCompletedTodayCount(),
            'average_waiting_time' => $this->queueRepository->getAverageWaitingTime($today),
        ];

        return Inertia::render('antrian/index', [
            'stats' => $stats,
        ]);
    }
}
