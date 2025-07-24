<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Antrian\DashboardController;
use App\Http\Controllers\Antrian\RoomController;
use App\Http\Controllers\Antrian\CounterController;
use App\Http\Controllers\Antrian\QueueController;
use App\Http\Controllers\Antrian\DisplayController;
use App\Http\Controllers\Antrian\KioskController;
use App\Http\Controllers\Antrian\OperatorController;

/*
|--------------------------------------------------------------------------
| Antrian Routes
|--------------------------------------------------------------------------
|
| Routes for hospital queue management system
|
*/

Route::middleware(['auth', 'verified'])->prefix('antrian')->name('antrian.')->group(function () {

// Main Dashboard
Route::get('/', [DashboardController::class, 'index'])
    ->name('index')
    ->middleware('permission:dashboard.antrian');

// Dashboard
Route::get('/dashboard', [QueueController::class, 'dashboard'])
    ->name('dashboard')
    ->middleware('permission:queue.dashboard');

// Room Management
Route::prefix('rooms')->name('rooms.')->group(function () {
    Route::get('/', [RoomController::class, 'index'])
        ->name('index');
        // ->middleware('permission:room.view');
    
    Route::get('/create', [RoomController::class, 'create'])
        ->name('create');
        // ->middleware('permission:room.create');
    
    Route::post('/', [RoomController::class, 'store'])
        ->name('store');
        // ->middleware('permission:room.create');
    
    Route::get('/{id}', [RoomController::class, 'show'])
        ->name('show');
        // ->middleware('permission:room.view');
    
    Route::get('/{id}/edit', [RoomController::class, 'edit'])
        ->name('edit');
        // ->middleware('permission:room.edit');
    
    Route::put('/{id}', [RoomController::class, 'update'])
        ->name('update');
        // ->middleware('permission:room.edit');
    
    Route::delete('/{id}', [RoomController::class, 'destroy'])
        ->name('destroy');
        // ->middleware('permission:room.delete');
});

// Counter Management
Route::prefix('counters')->name('counters.')->group(function () {
    Route::get('/', [CounterController::class, 'index'])
        ->name('index');
        // ->middleware('permission:counter.view');
    
    Route::get('/create', [CounterController::class, 'create'])
        ->name('create');
        // ->middleware('permission:counter.create');
    
    Route::post('/', [CounterController::class, 'store'])
        ->name('store');
        // ->middleware('permission:counter.create');
    
    Route::get('/{id}', [CounterController::class, 'show'])
        ->name('show');
        // ->middleware('permission:counter.view');
    
    Route::get('/{id}/edit', [CounterController::class, 'edit'])
        ->name('edit');
        // ->middleware('permission:counter.edit');
    
    Route::put('/{id}', [CounterController::class, 'update'])
        ->name('update');
        // ->middleware('permission:counter.edit');
    
    Route::delete('/{id}', [CounterController::class, 'destroy'])
        ->name('destroy');
        // ->middleware('permission:counter.delete');
});

// Queue Management
Route::prefix('queues')->name('queues.')->group(function () {
    Route::get('/', [QueueController::class, 'index'])
        ->name('index')
        ->middleware('permission:queue.view');
    
    Route::get('/{id}', [QueueController::class, 'show'])
        ->name('show')
        ->middleware('permission:queue.view');
    
    Route::post('/', [QueueController::class, 'store'])
        ->name('store')
        ->middleware('permission:queue.create');
    
    Route::post('/call-next', [QueueController::class, 'callNext'])
        ->name('call-next')
        ->middleware('permission:queue.call');
    
    Route::patch('/{id}/serve', [QueueController::class, 'serve'])
        ->name('serve')
        ->middleware('permission:queue.serve');
    
    Route::patch('/{id}/complete', [QueueController::class, 'complete'])
        ->name('complete')
        ->middleware('permission:queue.complete');
    
    Route::patch('/{id}/cancel', [QueueController::class, 'cancel'])
        ->name('cancel')
        ->middleware('permission:queue.cancel');
    
    Route::get('/statistics', [QueueController::class, 'statistics'])
        ->name('statistics')
        ->middleware('permission:queue.statistics');
});

// Display Routes (Public)
Route::prefix('display')->name('display.')->group(function () {
    Route::get('/', [DisplayController::class, 'index'])
        ->name('index')
        ->middleware('permission:display.view');
    
    Route::get('/universal', [DisplayController::class, 'universal'])
        ->name('universal')
        ->middleware('permission:display.universal');
    
    Route::get('/universal-glass', [DisplayController::class, 'universalGlass'])
        ->name('universal-glass')
        ->middleware('permission:display.universal');
    
    Route::get('/room/{roomId}', [DisplayController::class, 'room'])
        ->name('room')
        ->middleware('permission:display.room');
    
    Route::get('/room-glass/{roomId}', [DisplayController::class, 'roomGlass'])
        ->name('room-glass')
        ->middleware('permission:display.room');
    
    Route::get('/counter/{counterId}', [DisplayController::class, 'counter'])
        ->name('counter')
        ->middleware('permission:display.counter');
    
    Route::get('/counter-glass/{counterId}', [DisplayController::class, 'counterGlass'])
        ->name('counter-glass')
        ->middleware('permission:display.counter');
});

// Kiosk Routes (Public)
Route::prefix('kiosk')->name('kiosk.')->group(function () {
    Route::get('/', [KioskController::class, 'index'])
        ->name('index');
    
    Route::get('/select-room', [KioskController::class, 'selectRoom'])
        ->name('select-room');
    
    Route::get('/room/{roomId}/select-counter', [KioskController::class, 'selectCounter'])
        ->name('select-counter');
    
    Route::post('/generate-ticket', [KioskController::class, 'generateTicket'])
        ->name('generate-ticket');
    
    Route::get('/ticket/{queueId}', [KioskController::class, 'ticket'])
        ->name('ticket');
});

// Operator Routes
Route::prefix('operator')->name('operator.')->group(function () {
    Route::get('/', [OperatorController::class, 'index'])
        ->name('index')
        ->middleware('permission:operator.dashboard');
    
    Route::get('/compact', [OperatorController::class, 'compact'])
        ->name('compact')
        ->middleware('permission:operator.dashboard');
    
    Route::post('/call-next', [OperatorController::class, 'callNext'])
        ->name('call-next')
        ->middleware('permission:operator.call');
    
    Route::patch('/queue/{queueId}/start-serving', [OperatorController::class, 'startServing'])
        ->name('start-serving')
        ->middleware('permission:operator.serve');
    
    Route::patch('/queue/{queueId}/complete', [OperatorController::class, 'completeQueue'])
        ->name('complete')
        ->middleware('permission:operator.complete');
    
    Route::patch('/queue/{queueId}/skip', [OperatorController::class, 'skipQueue'])
        ->name('skip')
        ->middleware('permission:operator.skip');
    
    Route::patch('/queue/{queueId}/recall', [OperatorController::class, 'recallQueue'])
        ->name('recall')
        ->middleware('permission:operator.recall');
    
    Route::get('/activity', [OperatorController::class, 'getActivity'])
        ->name('activity')
        ->middleware('permission:operator.activity');
    
    Route::get('/recall-history', [OperatorController::class, 'getRecallHistory'])
        ->name('recall-history')
        ->middleware('permission:operator.activity');
    
    Route::get('/create-test-data', [OperatorController::class, 'createTestData'])
        ->name('create-test-data');
});

// API Routes for Real-time Updates
Route::prefix('api')->name('api.')->group(function () {
    // Room API
    Route::get('/rooms', [RoomController::class, 'apiIndex'])->name('rooms.index');
    Route::get('/rooms/{id}/statistics', [RoomController::class, 'apiStatistics'])->name('rooms.statistics');
    
    // Counter API
    Route::get('/counters/room/{roomId}', [CounterController::class, 'apiByRoom'])->name('counters.by-room');
    Route::get('/counters/{id}/statistics', [CounterController::class, 'apiStatistics'])->name('counters.statistics');
    
    // Display API
    Route::get('/display/universal', [DisplayController::class, 'universalApi'])->name('display.universal');
    Route::get('/display/room/{roomId}', [DisplayController::class, 'apiRoom'])->name('display.room');
    Route::get('/display/counter/{counterId}', [DisplayController::class, 'apiCounter'])->name('display.counter');
    
    // Kiosk API
    Route::post('/kiosk/check-status', [KioskController::class, 'checkStatus'])->name('kiosk.check-status');
    Route::get('/kiosk/room/{roomId}/statistics', [KioskController::class, 'roomStatistics'])->name('kiosk.room-statistics');
    Route::get('/kiosk/counter/{counterId}/statistics', [KioskController::class, 'counterStatistics'])->name('kiosk.counter-statistics');
    
    // Operator API
    Route::get('/operator/counter/{counterId}/status', [OperatorController::class, 'getCounterStatus'])->name('operator.counter-status');
});

});
