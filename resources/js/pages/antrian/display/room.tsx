import { Head } from "@inertiajs/react";
import { 
    Building, 
    Clock, 
    RefreshCw, 
    Tv, 
    Activity, 
    Users, 
    MonitorSpeaker, 
    ArrowLeft,
    BarChart3,
    TrendingUp,
    Eye,
    MapPin,
    Timer,
    Maximize,
    Minimize,
    Volume2,
    VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import AnnouncementSound from "@/components/AnnouncementSound";

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
    created_at: string;
}

interface Props {
    room: Room;
    counters: Counter[];
    refresh_interval?: number;
}

export default function RoomDashboard({ room, counters: initialCounters, refresh_interval = 1000 }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [counters, setCounters] = useState(initialCounters);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('room-audio-enabled');
        return saved !== null ? saved === 'true' : true; // Default to true
    });
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [newlyCalledQueue, setNewlyCalledQueue] = useState<Queue | null>(null);
    const [previousQueues, setPreviousQueues] = useState<Set<string>>(new Set());

    // Initialize previous queues on mount to prevent initial audio trigger
    useEffect(() => {
        const currentQueues = new Set<string>();
        initialCounters.forEach((counter) => {
            if (counter.current_serving && counter.current_serving.called_at) {
                const queueId = `${counter.current_serving.id}-${counter.current_serving.called_at}`;
                currentQueues.add(queueId);
                console.log('🎯 Initializing previous queue on mount:', {
                    counterName: counter.name,
                    queueNumber: counter.current_serving.queue_number,
                    queueId
                });
            }
        });
        setPreviousQueues(currentQueues);
    }, []);

    // Initialize AudioContext when user first interacts
    const initializeAudioContext = () => {
        if (!audioContext && audioEnabled) {
            console.log('🎵 Initializing AudioContext for room display...');
            try {
                const context = new AudioContext();
                setAudioContext(context);
                console.log('✅ AudioContext initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize AudioContext:', error);
            }
        }
    };

    // Set up click handler for audio initialization
    useEffect(() => {
        const handleUserInteraction = () => {
            initializeAudioContext();
            // Remove listener after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        if (audioEnabled && !audioContext) {
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('touchstart', handleUserInteraction);
        }

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, [audioEnabled, audioContext]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Auto refresh data every 1 second
    useEffect(() => {
        const refreshData = async () => {
            try {
                const response = await fetch(`/antrian/api/display/room/${room.id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        const newCounters = result.data;
                        
                        // Check for newly called queues
                        if (audioEnabled && newCounters) {
                            console.log('🔊 Audio is enabled, checking for newly called queues...');
                            let latestQueue: Queue | null = null;
                            const currentQueues = new Set<string>();
                            
                            newCounters.forEach((counter: Counter) => {
                                if (counter.current_serving) {
                                    const queueId = `${counter.current_serving.id}-${counter.current_serving.called_at}`;
                                    currentQueues.add(queueId);
                                    
                                    console.log('🔍 Checking queue:', {
                                        queueNumber: counter.current_serving.queue_number,
                                        queueId,
                                        calledAt: counter.current_serving.called_at,
                                        counterName: counter.name,
                                        inPrevious: previousQueues.has(queueId)
                                    });
                                    
                                    // Only consider queues that weren't in the previous set
                                    if (!previousQueues.has(queueId)) {
                                        // Find the queue with the latest called_at time
                                        if (!latestQueue || (counter.current_serving.called_at && counter.current_serving.called_at > (latestQueue.called_at || ''))) {
                                            latestQueue = counter.current_serving;
                                        }
                                    }
                                }
                            });

                            // Only announce the latest new queue (if any)
                            if (latestQueue) {
                                const queue = latestQueue as Queue;
                                console.log('📢 Latest new queue detected for announcement:', {
                                    queueNumber: queue.queue_number,
                                    counterName: queue.counter?.name,
                                    calledAt: queue.called_at,
                                    action: 'AUDIO_ANNOUNCEMENT_TRIGGERED'
                                });
                                
                                setNewlyCalledQueue(queue);
                            }
                            
                            // Update previous queues for next comparison
                            setPreviousQueues(currentQueues);
                        }
                        
                        setCounters(newCounters);
                    }
                }
            } catch (error) {
                console.error('Auto refresh failed:', error);
            }
        };

        const interval = setInterval(refreshData, refresh_interval);
        return () => clearInterval(interval);
    }, [refresh_interval, audioEnabled, previousQueues]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleManualRefresh = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/antrian/api/display/room/${room.id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setCounters(result.data);
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

    const formatQueueTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalWaitingCount = counters.reduce((sum, counter) => sum + counter.waiting_count, 0);
    const totalServingCount = counters.filter(counter => counter.current_serving).length;

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

    const toggleAudio = () => {
        const newAudioState = !audioEnabled;
        setAudioEnabled(newAudioState);
        localStorage.setItem('room-audio-enabled', newAudioState.toString());
        
        console.log('🔊 Audio toggled:', newAudioState ? 'enabled' : 'disabled');
        
        if (newAudioState && !audioContext) {
            initializeAudioContext();
        }
    };

    const testAudio = () => {
        console.log('🔊 Testing audio announcement...');
        
        if (!audioContext) {
            initializeAudioContext();
        }
        
        setNewlyCalledQueue({
            id: 999999,
            queue_number: 'A001',
            status: 'called',
            room: room,
            counter: { id: 1, name: 'Counter 1', code: 'C1', room: room, current_serving: undefined, waiting_count: 0, waiting_queues: [] },
            called_at: new Date().toISOString(),
            served_at: null,
            created_at: new Date().toISOString()
        });
    };

    const playAudio = (volume: number = 0.5) => {
        console.log('🔊 Audio requested to play:', { 
            audioEnabled, 
            hasAudioContext: !!audioContext, 
            volume,
            timestamp: new Date().toISOString()
        });
        
        if (!audioEnabled || !audioContext) {
            console.log('❌ Audio not enabled or no context available');
            return;
        }
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            
            console.log('✅ Audio oscillator created and started successfully');
        } catch (error) {
            console.error('❌ Error playing audio:', error);
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Head title={`Display ${room.name} - Sistem Antrian`} />
            
            {/* Audio Context Notification */}
            {audioEnabled && !audioContext && (
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
                            onClick={toggleAudio}
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
                                <Building className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {room.name}
                                </h1>
                                <p className="text-gray-600">
                                    {room.description || `Ruangan ${room.code}`} - {counters.length} Counter Aktif
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
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleAudio}
                                title={audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
                                className={!audioContext && audioEnabled ? 'border-orange-500 text-orange-600' : ''}
                            >
                                {audioEnabled ? (
                                    <>
                                        <Volume2 className="h-4 w-4 mr-2" />
                                        {!audioContext ? 'Audio (Klik untuk Init)' : 'Audio On'}
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
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Ruangan</h2>
                        
                        {/* Quick Stats */}
                        <div className="space-y-4 mb-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Total Menunggu</p>
                                        <p className="text-2xl font-bold text-orange-700">{totalWaitingCount}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Sedang Dilayani</p>
                                        <p className="text-2xl font-bold text-green-700">{totalServingCount}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Counter Aktif</p>
                                        <p className="text-2xl font-bold text-blue-700">{counters.length}</p>
                                    </div>
                                    <MonitorSpeaker className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Room Info */}
                        <div className="border border-gray-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <MapPin className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-900">Informasi Ruangan</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Kode:</span> {room.code}</p>
                                <p><span className="font-medium">Nama:</span> {room.name}</p>
                                {room.description && (
                                    <p><span className="font-medium">Deskripsi:</span> {room.description}</p>
                                )}
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
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Menunggu</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalWaitingCount}</p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            <TrendingUp className="h-3 w-3 inline mr-1" />
                                            Semua counter
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
                                        <p className="text-3xl font-bold text-gray-900">{totalServingCount}</p>
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
                                        <p className="text-sm font-medium text-gray-600">Counter Aktif</p>
                                        <p className="text-3xl font-bold text-gray-900">{counters.length}</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            <MonitorSpeaker className="h-3 w-3 inline mr-1" />
                                            Total counter
                                        </p>
                                    </div>
                                    <MonitorSpeaker className="h-10 w-10 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div> */}

                    {/* Counter Details */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {counters.map((counter) => (
                            <Card key={counter.id} className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-600 rounded-lg">
                                                <MonitorSpeaker className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-gray-900">{counter.name}</CardTitle>
                                                <p className="text-gray-600 text-sm">{counter.code}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            counter.current_serving 
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                            {counter.current_serving ? 'Melayani' : 'Siap'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {counter.current_serving ? (
                                        <div className="space-y-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-green-700 text-sm font-medium">Sedang Dilayani</p>
                                                        <p className="text-2xl font-bold text-green-800">
                                                            {counter.current_serving.queue_number}
                                                        </p>
                                                    </div>
                                                    <Activity className="h-8 w-8 text-green-600" />
                                                </div>
                                                {counter.current_serving.called_at && (
                                                    <div className="mt-3 text-xs text-green-600">
                                                        Dipanggil: {formatQueueTime(counter.current_serving.called_at)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {counter.waiting_queues && counter.waiting_queues.length > 0 && (
                                                <div>
                                                    <p className="text-gray-700 text-sm font-medium mb-2">
                                                        Antrian Menunggu ({counter.waiting_queues.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {counter.waiting_queues.slice(0, 8).map((queue) => (
                                                            <span 
                                                                key={queue.id} 
                                                                className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm border border-orange-200"
                                                            >
                                                                {queue.queue_number}
                                                            </span>
                                                        ))}
                                                        {counter.waiting_queues.length > 8 && (
                                                            <span className="text-gray-500 text-sm px-2 py-1">
                                                                +{counter.waiting_queues.length - 8} lainnya
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                            <Timer className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">Menunggu antrian</p>
                                            {counter.waiting_queues && counter.waiting_queues.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {counter.waiting_queues.length} antrian menunggu
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        {counter.waiting_queues.slice(0, 6).map((queue) => (
                                                            <span 
                                                                key={queue.id} 
                                                                className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
                                                            >
                                                                {queue.queue_number}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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

            {/* Audio Announcements */}
            {audioEnabled && audioContext && newlyCalledQueue && (
                <AnnouncementSound
                    queueNumber={newlyCalledQueue.queue_number}
                    counterName={newlyCalledQueue.counter.name}
                    roomName={room.name}
                    autoPlay={true}
                    audioContextInitialized={!!audioContext}
                    onComplete={() => {
                        console.log('🎵 Audio announcement completed for:', newlyCalledQueue.queue_number);
                        setNewlyCalledQueue(null);
                    }}
                />
            )}
        </div>
    );
}
