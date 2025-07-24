<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PublicQueueController;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', function () {
    return redirect('/login');
})->name('home');

// Public queue status routes (no auth required)
Route::prefix('queue')->name('queue.')->group(function () {
    Route::get('status/{queueNumber}', [PublicQueueController::class, 'show'])->name('status');
    Route::get('api/status/{queueNumber}', [PublicQueueController::class, 'status'])->name('api.status');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/master.php';
require __DIR__.'/antrian.php';
