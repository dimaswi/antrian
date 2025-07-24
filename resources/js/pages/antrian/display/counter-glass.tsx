import { Head } from "@inertiajs/react";
import { MonitorSpeaker, Building, Users, Clock, Activity, RefreshCw, Timer, AlertCircle, TrendingUp, Tv, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface Room {
    id: number;
    name: string;
    code: string;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    room: Room;
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

interface Statistics {
    total_queues_today: number;
    completed_today: number;
    average_service_time: number;
    current_waiting_count: number;
}

interface DisplayData {
    current_serving: Queue | null;
    waiting_queues: Queue[];
    waiting_count: number;
}

interface Props {
    counter: Counter;
    current_serving: Queue | null;
    waiting_queues: Queue[];
    statistics: Statistics;
    refresh_interval?: number;
}

export default function CounterGlassDisplay({ 
    counter, 
    current_serving: initialCurrentServing, 
    waiting_queues: initialWaitingQueues, 
    statistics, 
    refresh_interval = 2000 
}: Props) {
    const [displayData, setDisplayData] = useState<DisplayData>({
        current_serving: initialCurrentServing,
        waiting_queues: initialWaitingQueues || [],
        waiting_count: initialWaitingQueues?.length || 0
    });
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
                const response = await fetch(`/antrian/api/display/counter/${counter.id}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setDisplayData(result.data);
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
    }, [counter.id, refresh_interval]);

    const handleManualRefresh = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/antrian/api/display/counter/${counter.id}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setDisplayData(result.data);
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

    const formatServiceTime = (minutes: number) => {
        if (minutes < 60) {
            return `${Math.round(minutes)} menit`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            return `${hours}j ${remainingMinutes}m`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 p-6 relative overflow-hidden">
            <Head title={`Display ${counter.name} - ${counter.room.name}`} />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '5s' }}></div>
            </div>
            
            {/* Glass Header */}
            <div className="mb-8 relative">
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                <MonitorSpeaker className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {counter.name}
                                </h1>
                                <p className="text-xl text-white/80">
                                    {counter.room.name} - {counter.code}
                                </p>
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
                                    href={`/antrian/display/room/${counter.room.id}`} 
                                    target="_blank"
                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Ruangan
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
                            <p className="text-white/80 text-lg">Total Hari Ini</p>
                            <p className="text-3xl font-bold text-white">{statistics.total_queues_today}</p>
                        </div>
                        <div className="p-3 bg-blue-500/30 backdrop-blur-sm rounded-xl">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Selesai</p>
                            <p className="text-3xl font-bold text-white">{statistics.completed_today}</p>
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
                            <p className="text-3xl font-bold text-white">{displayData.waiting_count}</p>
                        </div>
                        <div className="p-3 bg-orange-500/30 backdrop-blur-sm rounded-xl">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Rata-rata</p>
                            <p className="text-xl font-bold text-white">{formatServiceTime(statistics.average_service_time)}</p>
                        </div>
                        <div className="p-3 bg-purple-500/30 backdrop-blur-sm rounded-xl">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Display Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Serving - Large Display */}
                <div className="lg:col-span-2">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden">
                        <div className={`p-8 border-b border-white/20 ${
                            displayData.current_serving 
                                ? 'bg-gradient-to-r from-green-500/60 to-green-600/60' 
                                : 'bg-gradient-to-r from-gray-500/40 to-gray-600/40'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Activity className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">SEDANG DILAYANI</h2>
                            </div>
                        </div>
                        
                        <div className="p-12">
                            {displayData.current_serving ? (
                                <div className="text-center">
                                    {/* Large Queue Number */}
                                    <div className="mb-8">
                                        <div className="text-8xl md:text-9xl font-bold text-white font-mono mb-4 tracking-wider">
                                            {displayData.current_serving.queue_number}
                                        </div>
                                        {displayData.current_serving.patient_name && (
                                            <div className="text-3xl text-white/80 mb-4">
                                                {displayData.current_serving.patient_name}
                                            </div>
                                        )}
                                        <Badge className={`${getStatusBadge(displayData.current_serving.status).className} text-lg px-4 py-2`}>
                                            {getStatusBadge(displayData.current_serving.status).label}
                                        </Badge>
                                    </div>

                                    {/* Service Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                        {displayData.current_serving.called_at && (
                                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Clock className="h-6 w-6 text-white/80" />
                                                    <h3 className="text-xl font-semibold text-white">Waktu Dipanggil</h3>
                                                </div>
                                                <div className="text-2xl font-mono text-white">
                                                    {new Date(displayData.current_serving.called_at).toLocaleTimeString('id-ID')}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {displayData.current_serving.served_at && (
                                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Activity className="h-6 w-6 text-white/80" />
                                                    <h3 className="text-xl font-semibold text-white">Mulai Dilayani</h3>
                                                </div>
                                                <div className="text-2xl font-mono text-white">
                                                    {new Date(displayData.current_serving.served_at).toLocaleTimeString('id-ID')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <Timer className="h-24 w-24 mx-auto mb-6 text-white/30" />
                                    <h3 className="text-4xl font-bold text-white/70 mb-4">Loket Tersedia</h3>
                                    <p className="text-2xl text-white/50">Siap melayani pasien berikutnya</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Queue */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500/60 to-blue-600/60 p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">ANTRIAN BERIKUTNYA</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {displayData.waiting_queues && displayData.waiting_queues.length > 0 ? (
                            <div className="text-center">
                                <div className="text-6xl font-bold text-white font-mono mb-4">
                                    {displayData.waiting_queues[0].queue_number}
                                </div>
                                {displayData.waiting_queues[0].patient_name && (
                                    <div className="text-xl text-white/80 mb-4">
                                        {displayData.waiting_queues[0].patient_name}
                                    </div>
                                )}
                                <Badge className={getStatusBadge(displayData.waiting_queues[0].status).className}>
                                    {getStatusBadge(displayData.waiting_queues[0].status).label}
                                </Badge>
                                <div className="text-sm text-white/60 mt-4">
                                    Waktu daftar: {new Date(displayData.waiting_queues[0].created_at).toLocaleTimeString('id-ID')}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Clock className="h-16 w-16 mx-auto mb-4 text-white/30" />
                                <p className="text-xl text-white/70 mb-2">Tidak ada antrian berikutnya</p>
                                <p className="text-white/50">Semua pasien sudah dilayani</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Waiting List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500/60 to-orange-600/60 p-6 border-b border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">DAFTAR TUNGGU</h2>
                            </div>
                            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-bold text-lg">
                                {displayData.waiting_count}
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        {displayData.waiting_queues && displayData.waiting_queues.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {displayData.waiting_queues.slice(0, 8).map((queue, index) => (
                                    <div 
                                        key={queue.id} 
                                        className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 ${
                                            index < 2 ? 'border-orange-300/40 bg-orange-500/10' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-xl font-bold text-white font-mono">
                                                    {queue.queue_number}
                                                    {index < 2 && (
                                                        <span className="ml-2 text-xs bg-orange-500/30 px-2 py-1 rounded">
                                                            #{index + 1}
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
                                    </div>
                                ))}
                                
                                {displayData.waiting_count > 8 && (
                                    <div className="text-center text-white/60 text-sm py-3 border-t border-white/10">
                                        ... dan {displayData.waiting_count - 8} antrian lainnya
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-white/30" />
                                <p className="text-xl text-white/70 mb-2">Tidak ada antrian menunggu</p>
                                <p className="text-white/50">Semua pasien sudah dilayani</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
