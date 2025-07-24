<?php

namespace App\Http\Controllers\Antrian;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function __construct(
        private RoomRepositoryInterface $roomRepository
    ) {}

    /**
     * Display a listing of rooms
     */
    public function index(): Response
    {
        $rooms = $this->roomRepository->getWithCounters();

        return Inertia::render('antrian/room/index', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Show the form for creating a new room
     */
    public function create(): Response
    {
        return Inertia::render('antrian/room/create');
    }

    /**
     * Store a newly created room
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rooms',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'prefix' => 'required|string|max:10'
        ]);

        $room = $this->roomRepository->create($validated);

        return redirect()->route('antrian.rooms.index')
            ->with('success', 'Room created successfully');
    }

    /**
     * Display the specified room
     */
    public function show(int $id): Response
    {
        $room = $this->roomRepository->findById($id);
        
        if (!$room) {
            abort(404);
        }

        $statistics = $this->roomRepository->getTodayStatistics($id);

        return Inertia::render('antrian/room/show', [
            'room' => $room,
            'statistics' => $statistics
        ]);
    }

    /**
     * Show the form for editing the specified room
     */
    public function edit(int $id): Response
    {
        $room = $this->roomRepository->findById($id);
        
        if (!$room) {
            abort(404);
        }

        return Inertia::render('antrian/room/edit', [
            'room' => $room
        ]);
    }

    /**
     * Update the specified room
     */
    public function update(Request $request, int $id)
    {
        $room = $this->roomRepository->findById($id);
        
        if (!$room) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rooms,code,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'prefix' => 'required|string|max:10'
        ]);

        $this->roomRepository->update($id, $validated);

        return redirect()->route('antrian.rooms.index')
            ->with('success', 'Room updated successfully');
    }

    /**
     * Remove the specified room
     */
    public function destroy(int $id)
    {
        $room = $this->roomRepository->findById($id);
        
        if (!$room) {
            abort(404);
        }

        $this->roomRepository->delete($id);

        return redirect()->route('antrian.rooms.index')
            ->with('success', 'Room deleted successfully');
    }

    /**
     * Get rooms for API
     */
    public function apiIndex()
    {
        $rooms = $this->roomRepository->getWithActiveCounters();

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }

    /**
     * Get room statistics for API
     */
    public function apiStatistics(int $id)
    {
        $statistics = $this->roomRepository->getTodayStatistics($id);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }
}
