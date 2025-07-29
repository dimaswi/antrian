<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\Antrian\RoomRepositoryInterface;
use App\Repositories\Interfaces\Antrian\CounterRepositoryInterface;
use App\Repositories\Interfaces\Antrian\QueueRepositoryInterface;
use App\Repositories\Antrian\RoomRepository;
use App\Repositories\Antrian\CounterRepository;
use App\Repositories\Antrian\QueueRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Antrian Repositories
        $this->app->bind(RoomRepositoryInterface::class, RoomRepository::class);
        $this->app->bind(CounterRepositoryInterface::class, CounterRepository::class);
        $this->app->bind(QueueRepositoryInterface::class, QueueRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa HTTPS berdasarkan header X-Forwarded-Proto
        if (
            isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
            $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'
        ) {
            URL::forceScheme('https');
            $this->app['request']->server->set('HTTPS', 'on');
        }
    }
}
