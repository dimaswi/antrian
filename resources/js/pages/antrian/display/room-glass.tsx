import { Head } from "@inertiajs/react";
import { 
    Building, 
    Clock, 
    RefreshCw, 
    Tv, 
    Activity, 
    Timer, 
    Users, 
    MonitorSpeaker, 
    AlertCircle, 
    MapPin,
    ArrowLeft 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
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
    room: Room;
    counters: Counter[];
    refresh_interval?: number;
}

export default function RoomGlassDisplay({ room, counters: initialCounters, refresh_interval = 3000 }: Props) {
    const [counters, setCounters] = useState<Counter[]>(initialCounters || []);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto refresh data
    useEffect(() => {
        const refreshData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/antrian/api/display/room/${room.id}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setCounters(result.data || []);
                    }
                }
            } catch (error) {
                console.error('Failed to refresh data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const interval = setInterval(refreshData, refresh_interval);
        return () => clearInterval(interval);
    }, [room.id, refresh_interval]);

    const handleManualRefresh = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/antrian/api/display/room/${room.id}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setCounters(result.data || []);
                }
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

    const getStatusBadge = (status: string) => {
        const statusMap = {
            waiting: { label: 'Menunggu', className: 'bg-orange-500/20 text-orange-100 border-orange-300/30' },
            called: { label: 'Dipanggil', className: 'bg-blue-500/20 text-blue-100 border-blue-300/30' },
            serving: { label: 'Dilayani', className: 'bg-green-500/20 text-green-100 border-green-300/30' },
            completed: { label: 'Selesai', className: 'bg-gray-500/20 text-gray-100 border-gray-300/30' },
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-500/20 text-gray-100 border-gray-300/30' };
    };

    const totalWaiting = counters.reduce((sum, counter) => sum + counter.waiting_count, 0);
    const totalServing = counters.filter(counter => counter.current_serving).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800 p-6 relative overflow-hidden">
            <Head title={`Display ${room.name} - Sistem Antrian`} />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '6s' }}></div>
            </div>
            
            {/* Glass Header */}
            <div className="mb-8 relative">
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                <Building className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {room.name}
                                </h1>
                                <p className="text-xl text-white/80">
                                    Display Ruangan - {room.code}
                                </p>
                                {room.description && (
                                    <p className="text-lg text-white/70 mt-1">
                                        {room.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-mono font-bold text-white mb-2">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-xl text-white/80 mb-4">
                                {formatDate(currentTime)}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={isLoading}
                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <a 
                                    href="/antrian/display" 
                                    target="_blank"
                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass Statistics Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Total Loket</p>
                            <p className="text-3xl font-bold text-white">{counters.length}</p>
                        </div>
                        <div className="p-3 bg-blue-500/30 backdrop-blur-sm rounded-xl">
                            <MonitorSpeaker className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Melayani</p>
                            <p className="text-3xl font-bold text-white">{totalServing}</p>
                        </div>
                        <div className="p-3 bg-green-500/30 backdrop-blur-sm rounded-xl">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-400/20 to-orange-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Menunggu</p>
                            <p className="text-3xl font-bold text-white">{totalWaiting}</p>
                        </div>
                        <div className="p-3 bg-orange-500/30 backdrop-blur-sm rounded-xl">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Tersedia</p>
                            <p className="text-3xl font-bold text-white">{counters.length - totalServing}</p>
                        </div>
                        <div className="p-3 bg-purple-500/30 backdrop-blur-sm rounded-xl">
                            <Timer className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Counter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counters.map((counter) => (
                    <div 
                        key={counter.id} 
                        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden hover:bg-white/15 transition-all duration-300"
                    >
                        {/* Counter Header */}
                        <div className={`p-6 border-b border-white/20 ${
                            counter.current_serving 
                                ? 'bg-gradient-to-r from-green-500/60 to-green-600/60' 
                                : 'bg-gradient-to-r from-gray-500/40 to-gray-600/40'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {counter.name}
                                    </h3>
                                    <p className="text-white/80">
                                        {counter.code}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <MonitorSpeaker className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Current Serving */}
                        <div className="p-6">
                            {counter.current_serving ? (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white/90 mb-3">Sedang Dilayani</h4>
                                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                        <div className="text-center mb-3">
                                            <div className="text-4xl font-bold text-white font-mono">
                                                {counter.current_serving.queue_number}
                                            </div>
                                            {counter.current_serving.patient_name && (
                                                <div className="text-white/80 mt-2">
                                                    {counter.current_serving.patient_name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Badge className={getStatusBadge(counter.current_serving.status).className}>
                                                {getStatusBadge(counter.current_serving.status).label}
                                            </Badge>
                                            {counter.current_serving.called_at && (
                                                <div className="text-sm text-white/70">
                                                    {new Date(counter.current_serving.called_at).toLocaleTimeString('id-ID')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 text-center">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                                        <Timer className="h-12 w-12 mx-auto mb-3 text-white/30" />
                                        <h4 className="text-lg font-semibold text-white/70 mb-2">Loket Tersedia</h4>
                                        <p className="text-white/50">Siap melayani pasien</p>
                                    </div>
                                </div>
                            )}

                            {/* Waiting Queue */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold text-white/90">Antrian Menunggu</h4>
                                    <span className="bg-orange-500/30 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-semibold">
                                        {counter.waiting_count}
                                    </span>
                                </div>
                                
                                {counter.waiting_queues && counter.waiting_queues.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {counter.waiting_queues.slice(0, 5).map((queue, index) => (
                                            <div 
                                                key={queue.id} 
                                                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex justify-between items-center ${
                                                    index === 0 ? 'border-orange-300/30 bg-orange-500/10' : ''
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-mono font-bold text-white">
                                                        {queue.queue_number}
                                                        {index === 0 && (
                                                            <span className="ml-2 text-xs bg-orange-500/30 px-2 py-1 rounded">
                                                                Berikutnya
                                                            </span>
                                                        )}
                                                    </div>
                                                    {queue.patient_name && (
                                                        <div className="text-sm text-white/70">
                                                            {queue.patient_name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={getStatusBadge(queue.status).className}>
                                                        {getStatusBadge(queue.status).label}
                                                    </Badge>
                                                    <div className="text-xs text-white/60 mt-1">
                                                        {new Date(queue.created_at).toLocaleTimeString('id-ID')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {counter.waiting_count > 5 && (
                                            <div className="text-center text-white/60 text-sm py-2">
                                                ... dan {counter.waiting_count - 5} antrian lainnya
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <Clock className="h-8 w-8 mx-auto mb-2 text-white/30" />
                                        <p className="text-white/60">Tidak ada antrian</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Action */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <a 
                                    href={`/antrian/display/counter/${counter.id}`} 
                                    target="_blank"
                                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Tv className="h-4 w-4" />
                                    Detail Loket
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Counters State */}
            {(!counters || counters.length === 0) && (
                <div className="text-center py-20">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-12 max-w-md mx-auto">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-white/30" />
                        <h3 className="text-2xl font-bold text-white mb-4">Belum Ada Loket</h3>
                        <p className="text-white/70 mb-6">
                            Ruangan ini belum memiliki loket yang terdaftar
                        </p>
                        <a 
                            href="/antrian/display" 
                            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300 inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Menu Display
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
