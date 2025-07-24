import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Clock, 
    MapPin, 
    MonitorSpeaker, 
    Users, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle,
    Timer,
    User
} from "lucide-react";

interface Room {
    id: number;
    name: string;
    code: string;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    type: string;
    room: Room;
}

interface Queue {
    id: number;
    queue_number: string;
    status: string;
    created_at: string;
    called_at: string | null;
    served_at: string | null;
    completed_at: string | null;
    room: Room;
    counter: Counter;
    called_by?: {
        id: number;
        name: string;
    };
}

interface Props {
    queue: Queue;
    position?: number;
    current_serving?: Queue;
    estimated_wait_time?: number;
}

export default function QueueStatus({ queue, position, current_serving, estimated_wait_time }: Props) {
    const [currentData, setCurrentData] = useState({ queue, position, current_serving, estimated_wait_time });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Auto refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                setIsRefreshing(true);
                const response = await fetch(`/queue/api/status/${queue.queue_number}`);
                const result = await response.json();
                
                if (result.success) {
                    setCurrentData({
                        queue: result.queue,
                        position: result.position,
                        current_serving: result.current_serving,
                        estimated_wait_time: result.estimated_wait_time
                    });
                    setLastUpdate(new Date());
                }
            } catch (error) {
                console.error('Failed to refresh queue status:', error);
            } finally {
                setIsRefreshing(false);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [queue.queue_number]);

    const getStatusInfo = (status: string) => {
        const statusMap = {
            waiting: { 
                label: 'Menunggu', 
                color: 'bg-orange-100 text-orange-800 border-orange-200',
                icon: Clock,
                description: 'Antrian Anda sedang menunggu untuk dipanggil'
            },
            called: { 
                label: 'Dipanggil', 
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: MonitorSpeaker,
                description: 'Antrian Anda telah dipanggil, silakan menuju loket'
            },
            serving: { 
                label: 'Sedang Dilayani', 
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: Users,
                description: 'Anda sedang dilayani di loket'
            },
            completed: { 
                label: 'Selesai', 
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: CheckCircle2,
                description: 'Layanan Anda telah selesai'
            },
            cancelled: { 
                label: 'Dibatalkan', 
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: AlertCircle,
                description: 'Antrian Anda telah dibatalkan'
            },
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.waiting;
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusInfo = getStatusInfo(currentData.queue.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Head title={`Status Antrian - ${queue.queue_number}`} />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Status Antrian
                    </h1>
                    <p className="text-lg text-gray-600">
                        Pantau status antrian Anda secara real-time
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Status */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Queue Number & Status */}
                        <Card className="border-2">
                            <CardHeader className="text-center pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <CardTitle className="text-2xl">Nomor Antrian Anda</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.reload()}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                                
                                <div className="text-6xl font-bold text-blue-600 font-mono bg-blue-50 py-6 rounded-lg border-2 border-blue-200 mb-4">
                                    {currentData.queue.queue_number}
                                </div>
                                
                                <div className="flex items-center justify-center gap-3">
                                    <StatusIcon className="h-6 w-6" />
                                    <Badge className={`text-lg px-4 py-2 border-2 ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                                
                                <p className="text-gray-600 mt-3">
                                    {statusInfo.description}
                                </p>
                            </CardHeader>
                        </Card>

                        {/* Position & Wait Time */}
                        {currentData.queue.status === 'waiting' && currentData.position && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="text-center">
                                        <CardTitle className="flex items-center justify-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Posisi Antrian
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-4xl font-bold text-orange-600 mb-2">
                                            #{currentData.position}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            dari depan
                                        </p>
                                    </CardContent>
                                </Card>

                                {currentData.estimated_wait_time && (
                                    <Card>
                                        <CardHeader className="text-center">
                                            <CardTitle className="flex items-center justify-center gap-2">
                                                <Timer className="h-5 w-5" />
                                                Estimasi Waktu
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center">
                                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                                ~{currentData.estimated_wait_time}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                menit lagi
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Currently Serving */}
                        {currentData.current_serving && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MonitorSpeaker className="h-5 w-5" />
                                        Sedang Dilayani Sekarang
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-green-600 font-mono mb-2">
                                                {currentData.current_serving.queue_number}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {currentData.current_serving.called_at && (
                                                    <>Dipanggil: {formatTime(currentData.current_serving.called_at)}</>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            {getStatusInfo(currentData.current_serving.status).label}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Location Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Informasi Lokasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Ruangan</p>
                                    <p className="font-semibold">{currentData.queue.room.name}</p>
                                    <p className="text-xs text-gray-500">{currentData.queue.room.code}</p>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Loket</p>
                                    <p className="font-semibold">{currentData.queue.counter.name}</p>
                                    <p className="text-xs text-gray-500">{currentData.queue.counter.code}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Timeline Antrian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Antrian Dibuat</p>
                                        <p className="text-xs text-gray-500">
                                            {formatTime(currentData.queue.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {currentData.queue.called_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Antrian Dipanggil</p>
                                            <p className="text-xs text-gray-500">
                                                {formatTime(currentData.queue.called_at)}
                                            </p>
                                            {currentData.queue.called_by && (
                                                <p className="text-xs text-gray-500">
                                                    oleh {currentData.queue.called_by.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentData.queue.served_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Mulai Dilayani</p>
                                            <p className="text-xs text-gray-500">
                                                {formatTime(currentData.queue.served_at)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {currentData.queue.completed_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Selesai Dilayani</p>
                                            <p className="text-xs text-gray-500">
                                                {formatTime(currentData.queue.completed_at)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Last Update Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-sm text-gray-500">
                                    <p>Terakhir diperbarui</p>
                                    <p className="font-mono">
                                        {lastUpdate.toLocaleTimeString('id-ID')}
                                    </p>
                                    <p className="text-xs mt-1">
                                        Auto refresh setiap 10 detik
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
