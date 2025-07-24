import { Head } from "@inertiajs/react";
import {
    Clock,
    RefreshCw,
    Activity,
    Users,
    MonitorSpeaker,
    ArrowLeft,
    TrendingUp,
    Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Room {
    id: number;
    name: string;
    code: string;
    description?: string;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    room: Room;
    current_serving?: Queue;
    waiting_count: number;
    waiting_queues: Queue[];
}

interface Queue {
    id: number;
    queue_number: string;
    status: string;
    room: Room;
    counter: Counter;
    called_at: string | null;
    served_at: string | null;
    patient_name?: string;
    created_at: string;
}

interface Props {
    counter: Counter;
    refresh_interval?: number;
}

export default function CounterDashboard({ counter, refresh_interval = 30000 }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            handleAutoRefresh();
        }, refresh_interval);
        return () => clearInterval(interval);
    }, [refresh_interval]);

    const handleAutoRefresh = async () => {
        try {
            const response = await fetch(window.location.href, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Auto refresh failed:', error);
        }
    };

    const handleManualRefresh = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(window.location.href, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatQueueTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={`Display Counter ${counter.name} - Sistem Antrian`} />
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <MonitorSpeaker className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{counter.name}</h1>
                            <p className="text-gray-600">{counter.code} • {counter.room.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xl font-mono font-bold text-gray-900">{formatTime(currentTime)}</div>
                            <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/antrian/display/room/" target="_blank">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center p-6">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Sedang Dilayani</p>
                                        <p className="text-3xl font-bold text-gray-900">{counter.current_serving ? 1 : 0}</p>
                                    </div>
                                    <Activity className="h-10 w-10 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Menunggu</p>
                                        <p className="text-3xl font-bold text-gray-900">{counter.waiting_count}</p>
                                    </div>
                                    <Users className="h-10 w-10 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Current Serving */}
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Sedang Dilayani
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {counter.current_serving ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-green-900">{counter.current_serving.queue_number}</div>
                                        {counter.current_serving.patient_name && (
                                            <div className="text-lg text-green-700 mt-2">{counter.current_serving.patient_name}</div>
                                        )}
                                        {counter.current_serving.called_at && (
                                            <div className="text-xs text-green-600 mt-2">Dipanggil: {formatQueueTime(counter.current_serving.called_at)}</div>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="border-green-400 text-green-700 text-lg px-4 py-2">
                                        {counter.current_serving.status}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Timer className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                    <div className="text-lg font-semibold">Belum ada antrian dilayani</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Waiting Queues */}
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Antrian Menunggu
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {counter.waiting_queues && counter.waiting_queues.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {counter.waiting_queues.slice(0, 12).map((queue) => (
                                        <div key={queue.id} className="bg-orange-100 border border-orange-200 rounded-lg px-4 py-2 text-orange-800 text-lg font-mono font-bold">
                                            {queue.queue_number}
                                            {queue.patient_name && (
                                                <div className="text-xs text-orange-700 mt-1">{queue.patient_name}</div>
                                            )}
                                        </div>
                                    ))}
                                    {counter.waiting_queues.length > 12 && (
                                        <div className="text-gray-500 text-sm px-2 py-1">+{counter.waiting_queues.length - 12} lainnya</div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Timer className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <div className="text-lg font-semibold">Tidak ada antrian menunggu</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 text-center shadow-xl">
                        <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-900 text-xl font-medium">Memperbarui data...</p>
                        <p className="text-gray-600 text-sm mt-2">Mohon tunggu sebentar</p>
                    </div>
                </div>
            )}
        </div>
    );
}
