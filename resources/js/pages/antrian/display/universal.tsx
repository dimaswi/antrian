import { Head } from "@inertiajs/react";
import { Tv, Building, MonitorSpeaker, Users, Clock, Activity, RefreshCw, BarChart3, TrendingUp, Eye, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import AnnouncementSound from "@/components/AnnouncementSound";

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
    current_queue?: Queue;
    waiting_queues?: Queue[];
}

interface Queue {
    id: number;
    queue_number: string;
    status: string;
    room: Room;
    counter: Counter;
    called_at: string | null;
}

interface RoomData {
    counters: { [counterName: string]: Counter };
}

interface DisplayData {
    current_serving: Queue[];
    waiting_queues: Queue[];
    recent_completed: Queue[];
    rooms?: { [roomName: string]: RoomData };
    statistics: {
        total_waiting: number;
        total_serving: number;
        total_completed_today: number;
    };
}

interface Props {
    data?: DisplayData;
}

export default function UniversalDisplay({ data: initialData }: Props) {
    // Default data structure
    const defaultData: DisplayData = {
        current_serving: [],
        waiting_queues: [],
        recent_completed: [],
        statistics: {
            total_waiting: 0,
            total_serving: 0,
            total_completed_today: 0,
        },
    };

    const [data, setData] = useState<DisplayData>(initialData || defaultData);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('universal-audio-enabled');
        return saved !== null ? saved === 'true' : true; // Default to true
    });
    const [audioContextInitialized, setAudioContextInitialized] = useState(false);
    const [lastAnnouncedQueues, setLastAnnouncedQueues] = useState<Set<string>>(new Set());
    const [newlyCalledQueue, setNewlyCalledQueue] = useState<Queue | null>(null);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Auto refresh data every 3 seconds
    useEffect(() => {
        const refreshData = async () => {
            try {
                const response = await fetch('/antrian/api/display/universal');
                if (response.ok) {
                    const newData = await response.json();
                    
                    // Check for newly called queues
                    if (audioEnabled && newData.current_serving) {
                        console.log('🔊 Audio is enabled, checking for newly called queues...');
                        let latestQueue: Queue | null = null;
                        
                        newData.current_serving.forEach((queue: Queue) => {
                            // Use called_at timestamp to detect new calls (including recalls)
                            const queueId = `${queue.id}-${queue.called_at}`;
                            
                            console.log('🔍 Checking queue:', {
                                queueNumber: queue.queue_number,
                                queueId,
                                calledAt: queue.called_at,
                                inAnnounced: lastAnnouncedQueues.has(queueId),
                                counterName: queue.counter?.name
                            });
                            
                            // Check if this is a newly called queue (new called_at timestamp)
                            if (!lastAnnouncedQueues.has(queueId)) {
                                // Find the queue with the latest called_at time
                                if (!latestQueue || (queue.called_at && queue.called_at > (latestQueue.called_at || ''))) {
                                    latestQueue = queue;
                                }
                            } else {
                                console.log('⏭️ Queue already processed:', {
                                    queueNumber: queue.queue_number,
                                    queueId,
                                    inAnnounced: lastAnnouncedQueues.has(queueId)
                                });
                            }
                        });

                        // Only announce the latest queue (if any)
                        if (latestQueue) {
                            const queue = latestQueue as Queue;
                            const latestQueueId = `${queue.id}-${queue.called_at}`;
                            console.log('📢 Latest queue detected for announcement:', {
                                queueNumber: queue.queue_number,
                                counterName: queue.counter?.name,
                                queueId: latestQueueId,
                                calledAt: queue.called_at,
                                action: 'AUDIO_ANNOUNCEMENT_TRIGGERED'
                            });
                            
                            setNewlyCalledQueue(queue);
                            
                            // Add to announced set
                            setLastAnnouncedQueues(prev => new Set([...prev, latestQueueId]));
                        }
                    }
                    
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

        const interval = setInterval(refreshData, 3000); // Refresh every 3 seconds
        return () => clearInterval(interval);
    }, [audioEnabled, data.current_serving, lastAnnouncedQueues]);

    const handleManualRefresh = async () => {
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

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    const testAudio = async () => {
        console.log('🔊 Testing audio announcement...');
        
        // Initialize audio context if not already done
        if (!audioContextInitialized) {
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    const testContext = new AudioContext();
                    if (testContext.state === 'suspended') {
                        await testContext.resume();
                    }
                    testContext.close();
                    setAudioContextInitialized(true);
                    console.log('✅ Audio context initialized for test');
                }
            } catch (error) {
                console.error('❌ Failed to initialize audio context for test:', error);
            }
        }
        
        // Set a test queue for announcement
        const testQueue = {
            id: 999999,
            queue_number: 'A001',
            status: 'called',
            room: { id: 1, name: 'Test Room', code: 'TR' },
            counter: { id: 1, name: 'Test Counter', code: 'TC', room: { id: 1, name: 'Test Room', code: 'TR' } },
            called_at: new Date().toISOString()
        };
        setNewlyCalledQueue(testQueue);
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Head title="Display Universal - Sistem Antrian" />
            
            {/* Audio Context Notification */}
            {audioEnabled && !audioContextInitialized && (
                <div className="bg-orange-100 border-b border-orange-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Volume2 className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-orange-800 font-medium">Audio Belum Aktif</p>
                                <p className="text-orange-600 text-sm">Klik tombol "Audio (Klik untuk Init)" untuk mengaktifkan pengumuman suara</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const newAudioState = !audioEnabled;
                                setAudioEnabled(newAudioState);
                                localStorage.setItem('universal-audio-enabled', newAudioState.toString());
                                
                                if (newAudioState && !audioContextInitialized) {
                                    try {
                                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                                        if (AudioContext) {
                                            const testContext = new AudioContext();
                                            if (testContext.state === 'suspended') {
                                                await testContext.resume();
                                            }
                                            testContext.close();
                                            setAudioContextInitialized(true);
                                            console.log('✅ Audio context initialized with user gesture');
                                        }
                                    } catch (error) {
                                        console.error('❌ Failed to initialize audio context:', error);
                                    }
                                }
                            }}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                            Aktifkan Audio
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Dashboard Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Tv className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Display Universal
                                </h1>
                                <p className="text-gray-600">
                                    Sistem Antrian Rumah Sakit - Semua Ruangan
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xl font-mono font-bold text-gray-900">
                                    {formatTime(currentTime)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {formatDate(currentTime)}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleManualRefresh}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    const newAudioState = !audioEnabled;
                                    setAudioEnabled(newAudioState);
                                    localStorage.setItem('universal-audio-enabled', newAudioState.toString());
                                    
                                    // Initialize audio context when enabling audio
                                    if (newAudioState && !audioContextInitialized) {
                                        try {
                                            // Create a dummy audio context to initialize it with user gesture
                                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                                            if (AudioContext) {
                                                const testContext = new AudioContext();
                                                if (testContext.state === 'suspended') {
                                                    await testContext.resume();
                                                }
                                                testContext.close();
                                                setAudioContextInitialized(true);
                                                console.log('✅ Audio context initialized with user gesture');
                                            }
                                        } catch (error) {
                                            console.error('❌ Failed to initialize audio context:', error);
                                        }
                                    }
                                }}
                                title={audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
                                className={!audioContextInitialized && audioEnabled ? 'border-orange-500 text-orange-600' : ''}
                            >
                                {audioEnabled ? (
                                    <>
                                        <Volume2 className="h-4 w-4 mr-2" />
                                        {!audioContextInitialized ? 'Audio (Klik untuk Init)' : 'Audio On'}
                                    </>
                                ) : (
                                    <>
                                        <VolumeX className="h-4 w-4 mr-2" />
                                        Audio Off
                                    </>
                                )}
                            </Button>
                            {audioEnabled && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={testAudio}
                                    title="Test Audio"
                                >
                                    🔊 Test
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            >
                                {isFullscreen ? (
                                    <Minimize className="h-4 w-4 mr-2" />
                                ) : (
                                    <Maximize className="h-4 w-4 mr-2" />
                                )}
                                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href="/antrian/display" target="_blank">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Menu Display
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar Navigation */}
                <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
                        
                        {/* Quick Stats */}
                        <div className="space-y-4 mb-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Menunggu</p>
                                        <p className="text-2xl font-bold text-orange-700">{data?.statistics?.total_waiting || 0}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Sedang Dilayani</p>
                                        <p className="text-2xl font-bold text-green-700">{data?.statistics?.total_serving || 0}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Selesai Hari Ini</p>
                                        <p className="text-2xl font-bold text-blue-700">{data?.statistics?.total_completed_today || 0}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Auto Refresh Status */}
                    <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Auto-refresh setiap 3 detik</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Terakhir update: {formatTime(currentTime)}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Performance Metrics */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Menunggu</p>
                                        <p className="text-3xl font-bold text-gray-900">{data?.statistics?.total_waiting || 0}</p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            <TrendingUp className="h-3 w-3 inline mr-1" />
                                            Antrian aktif
                                        </p>
                                    </div>
                                    <Clock className="h-10 w-10 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Sedang Dilayani</p>
                                        <p className="text-3xl font-bold text-gray-900">{data?.statistics?.total_serving || 0}</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            <Activity className="h-3 w-3 inline mr-1" />
                                            Counter aktif
                                        </p>
                                    </div>
                                    <Activity className="h-10 w-10 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Selesai Hari Ini</p>
                                        <p className="text-3xl font-bold text-gray-900">{data?.statistics?.total_completed_today || 0}</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            <Users className="h-3 w-3 inline mr-1" />
                                            Total dilayani
                                        </p>
                                    </div>
                                    <Users className="h-10 w-10 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Efisiensi</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {data?.statistics?.total_completed_today && data?.statistics?.total_serving ? 
                                                Math.round((data.statistics.total_completed_today / (data.statistics.total_completed_today + data.statistics.total_serving)) * 100) : 0}%
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            <BarChart3 className="h-3 w-3 inline mr-1" />
                                            Tingkat layanan
                                        </p>
                                    </div>
                                    <BarChart3 className="h-10 w-10 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div> */}

                    {/* Room Data Tables */}
                    <div className="space-y-6">
                        {data?.rooms && Object.entries(data.rooms).map(([roomName, roomData]: [string, any]) => (
                            <Card key={roomName} className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600 rounded-lg flex-shrink-0">
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-xl text-gray-900 truncate">{roomName}</CardTitle>
                                            <p className="text-gray-600 text-sm">
                                                {roomData.counters ? Object.keys(roomData.counters).length : 0} Counter Aktif
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {roomData.counters && Object.entries(roomData.counters).map(([counterName, counterData]: [string, any]) => (
                                            <div key={counterName} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{counterName}</h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                                        counterData.current_queue 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                        {counterData.current_queue ? 'Melayani' : 'Siap'}
                                                    </span>
                                                </div>

                                                {counterData.current_queue ? (
                                                    <div className="space-y-4">
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-green-700 text-sm font-medium">Sedang Dilayani</p>
                                                                    <p className="text-2xl font-bold text-green-800 truncate">
                                                                        {counterData.current_queue.queue_number}
                                                                    </p>
                                                                </div>
                                                                <Activity className="h-8 w-8 text-green-600 flex-shrink-0 ml-3" />
                                                            </div>
                                                        </div>
                                                        
                                                        {counterData.waiting_queues && counterData.waiting_queues.length > 0 && (
                                                            <div>
                                                                <p className="text-gray-700 text-sm font-medium mb-2">
                                                                    Antrian Menunggu ({counterData.waiting_queues.length}):
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {counterData.waiting_queues.slice(0, 6).map((queue: any) => (
                                                                        <span 
                                                                            key={queue.id} 
                                                                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm border border-orange-200"
                                                                        >
                                                                            {queue.queue_number}
                                                                        </span>
                                                                    ))}
                                                                    {counterData.waiting_queues.length > 6 && (
                                                                        <span className="text-gray-500 text-sm px-2 py-1">
                                                                            +{counterData.waiting_queues.length - 6} lainnya
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-gray-600 text-sm">Menunggu antrian</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Global Queue Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Currently Serving */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-green-600 text-white">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Activity className="h-6 w-6" />
                                    SEDANG DILAYANI
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {(data?.current_serving && data.current_serving.length > 0) ? (
                                        // Sort by called_at descending (newest first)
                                        [...data.current_serving]
                                            .sort((a, b) => {
                                                if (!a.called_at && !b.called_at) return 0;
                                                if (!a.called_at) return 1;
                                                if (!b.called_at) return -1;
                                                return new Date(b.called_at).getTime() - new Date(a.called_at).getTime();
                                            })
                                            .map((queue) => (
                                            <div
                                                key={queue.id}
                                                className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-2xl font-bold text-green-700 font-mono">
                                                            {queue.queue_number}
                                                        </div>
                                                        {queue.called_at && (
                                                            <div className="text-xs text-green-600 mt-1">
                                                                Dipanggil: {new Date(queue.called_at).toLocaleTimeString('id-ID', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-4 min-w-0">
                                                        <div className="flex items-center justify-end gap-2 text-green-700 mb-1">
                                                            <span className="font-semibold text-right">{queue.room.name}</span>
                                                            <Building className="h-4 w-4 flex-shrink-0" />
                                                        </div>
                                                        <div className="flex items-center justify-end gap-2 text-green-600">
                                                            <span className="text-right">{queue.counter.name}</span>
                                                            <MonitorSpeaker className="h-4 w-4 flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-xl">Tidak ada antrian yang sedang dilayani</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Waiting Queue */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-orange-600 text-white">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Clock className="h-6 w-6" />
                                    ANTRIAN MENUNGGU
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(data?.waiting_queues && data.waiting_queues.length > 0) ? (
                                        data.waiting_queues.slice(0, 10).map((queue, index) => (
                                            <div
                                                key={queue.id}
                                                className={`p-3 rounded-lg border ${
                                                    index < 3 
                                                        ? 'bg-orange-50 border-orange-200' 
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xl font-bold font-mono ${
                                                            index < 3 ? 'text-orange-700' : 'text-gray-700'
                                                        }`}>
                                                            {queue.queue_number}
                                                        </div>
                                                        {index < 3 && (
                                                            <Badge variant="secondary" className="mt-2">
                                                                {index === 0 ? 'Selanjutnya' : `Urutan ${index + 1}`}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right text-sm flex-shrink-0 ml-4 min-w-0">
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <span className="font-medium text-right">{queue.room.code}</span>
                                                            <Building className="h-3 w-3 flex-shrink-0" />
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                                            <span className="text-right">{queue.counter.code}</span>
                                                            <MonitorSpeaker className="h-3 w-3 flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-xl">Tidak ada antrian menunggu</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Completed */}
                    {(data?.recent_completed && data.recent_completed.length > 0) && (
                        <Card className="mt-6 border-0 shadow-lg">
                            <CardHeader className="bg-blue-600 text-white">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Users className="h-6 w-6" />
                                    ANTRIAN SELESAI TERAKHIR
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {data.recent_completed.slice(0, 12).map((queue) => (
                                        <div
                                            key={queue.id}
                                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center"
                                        >
                                            <div className="text-lg font-bold text-blue-700 font-mono">
                                                {queue.queue_number}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                {queue.room.code} - {queue.counter.code}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Announcement Sound */}
            {newlyCalledQueue && audioEnabled && (
                <AnnouncementSound
                    queueNumber={newlyCalledQueue.queue_number}
                    counterName={newlyCalledQueue.counter.name}
                    roomName={newlyCalledQueue.room.name}
                    autoPlay={true}
                    audioContextInitialized={audioContextInitialized}
                    onComplete={() => setNewlyCalledQueue(null)}
                />
            )}
        </div>
    );
}
