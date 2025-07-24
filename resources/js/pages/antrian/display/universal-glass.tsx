import { Head } from "@inertiajs/react";
import { Tv, Building, MonitorSpeaker, Users, Clock, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    patient_name?: string;
}

interface DisplayData {
    current_serving: Queue[];
    waiting_queues: Queue[];
    recent_completed: Queue[];
    statistics: {
        total_waiting: number;
        total_serving: number;
        total_completed_today: number;
    };
}

interface Props {
    data?: DisplayData;
}

export default function UniversalGlassDisplay({ data: initialData }: Props) {
    const defaultData: DisplayData = {
        current_serving: [],
        waiting_queues: [],
        recent_completed: [],
        statistics: {
            total_waiting: 0,
            total_serving: 0,
            total_completed_today: 0,
        }
    };

    const [data, setData] = useState<DisplayData>({
        ...defaultData,
        ...initialData,
        statistics: {
            ...defaultData.statistics,
            ...initialData?.statistics
        }
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

    // Auto refresh data every 30 seconds
    useEffect(() => {
        const refreshData = async () => {
            try {
                const response = await fetch('/antrian/api/display/universal');
                if (response.ok) {
                    const newData = await response.json();
                    setData(prevData => ({
                        ...defaultData,
                        ...newData,
                        statistics: {
                            ...defaultData.statistics,
                            ...newData?.statistics
                        }
                    }));
                }
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        };

        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleManualRefresh = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/antrian/api/display/universal');
            if (response.ok) {
                const newData = await response.json();
                setData(prevData => ({
                    ...defaultData,
                    ...newData,
                    statistics: {
                        ...defaultData.statistics,
                        ...newData?.statistics
                    }
                }));
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-6 relative overflow-hidden">
            <Head title="Display Universal - Sistem Antrian" />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
            
            {/* Glass Header */}
            <div className="mb-8 relative">
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                <Tv className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    SISTEM ANTRIAN RUMAH SAKIT
                                </h1>
                                <p className="text-xl text-white/80">
                                    Display Universal - Semua Ruangan
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
                                    href="/antrian/display" 
                                    target="_blank"
                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Building className="h-4 w-4" />
                                    Menu Display
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass Statistics Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-400/20 to-orange-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Menunggu</p>
                            <p className="text-4xl font-bold text-white">{data?.statistics?.total_waiting || 0}</p>
                        </div>
                        <div className="p-3 bg-orange-500/30 backdrop-blur-sm rounded-xl">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Sedang Dilayani</p>
                            <p className="text-4xl font-bold text-white">{data?.statistics?.total_serving || 0}</p>
                        </div>
                        <div className="p-3 bg-green-500/30 backdrop-blur-sm rounded-xl">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-lg">Selesai Hari Ini</p>
                            <p className="text-4xl font-bold text-white">{data?.statistics?.total_completed_today || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-500/30 backdrop-blur-sm rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Glass Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Currently Serving */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">SEDANG DILAYANI</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(data?.current_serving && data.current_serving.length > 0) ? (
                                data.current_serving.map((queue) => (
                                    <div
                                        key={queue.id}
                                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-bold text-white font-mono mb-2">
                                                    {queue.queue_number}
                                                </div>
                                                {queue.patient_name && (
                                                    <div className="text-white/80 mb-2">
                                                        {queue.patient_name}
                                                    </div>
                                                )}
                                                <Badge className={getStatusBadge(queue.status).className}>
                                                    {getStatusBadge(queue.status).label}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-white mb-2">
                                                    <Building className="h-4 w-4" />
                                                    <span className="font-semibold">{queue.room.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80 mb-3">
                                                    <MonitorSpeaker className="h-4 w-4" />
                                                    <span>{queue.counter.name}</span>
                                                </div>
                                                {queue.called_at && (
                                                    <div className="text-sm text-white/60 mb-3">
                                                        Dipanggil: {new Date(queue.called_at).toLocaleTimeString('id-ID')}
                                                    </div>
                                                )}
                                                <a 
                                                    href={`/antrian/display/room/${queue.room.id}`} 
                                                    target="_blank"
                                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1 text-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-1"
                                                >
                                                    <Building className="h-3 w-3" />
                                                    Detail Ruangan
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Activity className="h-16 w-16 mx-auto mb-4 text-white/30" />
                                    <p className="text-xl text-white/80 mb-2">Tidak ada antrian yang sedang dilayani</p>
                                    <p className="text-white/60">Semua loket sedang kosong</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Waiting Queue */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">ANTRIAN MENUNGGU</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(data?.waiting_queues && data.waiting_queues.length > 0) ? (
                                data.waiting_queues.slice(0, 10).map((queue, index) => (
                                    <div
                                        key={queue.id}
                                        className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 ${
                                            index < 3 ? 'border-orange-300/40 bg-orange-500/10' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-2xl font-bold text-white font-mono mb-2">
                                                    {queue.queue_number}
                                                    {index < 3 && (
                                                        <span className="ml-2 text-sm bg-orange-500/30 px-2 py-1 rounded-lg">
                                                            #{index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                {queue.patient_name && (
                                                    <div className="text-white/80 mb-2">
                                                        {queue.patient_name}
                                                    </div>
                                                )}
                                                <Badge className={getStatusBadge(queue.status).className}>
                                                    {getStatusBadge(queue.status).label}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-white mb-2">
                                                    <Building className="h-4 w-4" />
                                                    <span className="font-semibold">{queue.room.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80 mb-3">
                                                    <MonitorSpeaker className="h-4 w-4" />
                                                    <span>{queue.counter.name}</span>
                                                </div>
                                                <a 
                                                    href={`/antrian/display/counter/${queue.counter.id}`} 
                                                    target="_blank"
                                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1 text-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-1"
                                                >
                                                    <MonitorSpeaker className="h-3 w-3" />
                                                    Detail Loket
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Clock className="h-16 w-16 mx-auto mb-4 text-white/30" />
                                    <p className="text-xl text-white/80 mb-2">Tidak ada antrian menunggu</p>
                                    <p className="text-white/60">Semua pasien sudah dilayani</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Completed - Full Width */}
            {data?.recent_completed && data.recent_completed.length > 0 && (
                <div className="mt-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm p-6 border-b border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">BARU SAJA SELESAI</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.recent_completed.slice(0, 6).map((queue) => (
                                    <div
                                        key={queue.id}
                                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                                    >
                                        <div className="text-xl font-bold text-white font-mono mb-2">
                                            {queue.queue_number}
                                        </div>
                                        {queue.patient_name && (
                                            <div className="text-white/80 mb-2">
                                                {queue.patient_name}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                                            <Building className="h-3 w-3" />
                                            <span>{queue.room.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/70 text-sm">
                                            <MonitorSpeaker className="h-3 w-3" />
                                            <span>{queue.counter.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
