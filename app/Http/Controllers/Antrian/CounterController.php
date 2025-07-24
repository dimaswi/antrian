<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CounterController extends Controller
{
    public function __construct(
        private CounterRepositoryInterface $counterRepository,
        private RoomRepositoryInterface $roomRepository
    ) {}

    /**
     * Display a listing of counters
     */
    public function index(): Response
    {
        $counters = $this->counterRepository->getAll();

        return Inertia::render('antrian/counter/index', [
            'counters' => $counters
        ]);
    }

    /**
     * Show the form for creating a new counter
     */
    public function create(): Response
    {
        $rooms = $this->roomRepository->getActive();

        return Inertia::render('antrian/counter/create', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Store a newly created counter
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:counters',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'type' => 'required|string|max:255'
        ]);

        $counter = $this->counterRepository->create($validated);

        return redirect()->route('antrian.counters.index')
            ->with('success', 'Counter created successfully');
    }

    /**
     * Display the specified counter
     */
    public function show(int $id): Response
    {
        $counter = $this->counterRepository->findById($id);
        
        if (!$counter) {
            abort(404);
        }

        $statistics = $this->counterRepository->getTodayStatistics($id);

        return Inertia::render('antrian/counter/show', [
            'counter' => $counter,
            'statistics' => $statistics
        ]);
    }

    /**
     * Show the form for editing the specified counter
     */
    public function edit(int $id): Response
    {
        $counter = $this->counterRepository->findById($id);
        
        if (!$counter) {
            abort(404);
        }

        $rooms = $this->roomRepository->getActive();

        return Inertia::render('antrian/counter/edit', [
            'counter' => $counter,
            'rooms' => $rooms
        ]);
    }

    /**
     * Update the specified counter
     */
    public function update(Request $request, int $id)
    {
        $counter = $this->counterRepository->findById($id);
        
        if (!$counter) {
            abort(404);
        }

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:counters,code,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'type' => 'required|string|max:255'
        ]);

        $this->counterRepository->update($id, $validated);

        return redirect()->route('antrian.counters.index')
            ->with('success', 'Counter updated successfully');
    }

    /**
     * Remove the specified counter
     */
    public function destroy(int $id)
    {
        $counter = $this->counterRepository->findById($id);
        
        if (!$counter) {
            abort(404);
        }

        $this->counterRepository->delete($id);

        return redirect()->route('antrian.counters.index')
            ->with('success', 'Counter deleted successfully');
    }

    /**
     * Get counters by room for API
     */
    public function apiByRoom(int $roomId)
    {
        $counters = $this->counterRepository->getActiveByRoom($roomId);

        return response()->json([
            'success' => true,
            'data' => $counters
        ]);
    }

    /**
     * Get counter statistics for API
     */
    public function apiStatistics(int $id)
    {
        $statistics = $this->counterRepository->getTodayStatistics($id);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }
}
