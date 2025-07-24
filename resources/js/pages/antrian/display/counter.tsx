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
    counter: Counter;
    refresh_interval?: number;
}

export default function CounterDashboard({ counter: initialCounter, refresh_interval = 1000 }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [counter, setCounter] = useState(initialCounter);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('counter-audio-enabled');
        return saved !== null ? saved === 'true' : true; // Default to true
    });
    const [audioContextInitialized, setAudioContextInitialized] = useState(false);
    const [newlyCalledQueue, setNewlyCalledQueue] = useState<Queue | null>(null);
    const [previousQueue, setPreviousQueue] = useState<Queue | null>(null);

    // Initialize previous queue on mount to prevent initial audio trigger
    useEffect(() => {
        if (initialCounter.current_serving) {
            setPreviousQueue(initialCounter.current_serving);
            console.log('🎯 Initializing previous queue on mount:', {
                queueNumber: initialCounter.current_serving.queue_number,
                queueId: `${initialCounter.current_serving.id}-${initialCounter.current_serving.called_at}`,
                counterName: initialCounter.name
            });
        }
    }, []);

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
                const response = await fetch(`/antrian/api/display/counter/${counter.id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        const newCounter = {
                            ...counter,
                            current_serving: result.data.current_serving,
                            waiting_queues: result.data.waiting_queues,
                            waiting_count: result.data.waiting_count
                        };
                        
                        // Check for newly called queues
                        if (audioEnabled && newCounter.current_serving) {
                            console.log('🔊 Audio is enabled, checking for newly called queue...');
                            
                            const currentQueue = newCounter.current_serving;
                            const currentQueueId = `${currentQueue.id}-${currentQueue.called_at}`;
                            const previousQueueId = previousQueue ? `${previousQueue.id}-${previousQueue.called_at}` : null;
                            
                            console.log('🔍 Checking queue:', {
                                queueNumber: currentQueue.queue_number,
                                currentQueueId,
                                previousQueueId,
                                calledAt: currentQueue.called_at,
                                counterName: newCounter.name,
                                isDifferent: currentQueueId !== previousQueueId
                            });
                            
                            // Only announce if this is a different queue (including new calls/recalls)
                            if (currentQueueId !== previousQueueId) {
                                console.log('📢 New queue detected for announcement:', {
                                    queueNumber: currentQueue.queue_number,
                                    counterName: newCounter.name,
                                    currentQueueId,
                                    previousQueueId,
                                    calledAt: currentQueue.called_at,
                                    action: 'AUDIO_ANNOUNCEMENT_TRIGGERED'
                                });
                                
                                setNewlyCalledQueue(currentQueue);
                            } else {
                                console.log('⏭️ Same queue, no announcement needed:', {
                                    queueNumber: currentQueue.queue_number,
                                    queueId: currentQueueId
                                });
                            }
                        }
                        
                        // Update previous queue for comparison
                        setPreviousQueue(newCounter.current_serving);
                        setCounter(newCounter);
                    }
                }
            } catch (error) {
                console.error('Auto refresh failed:', error);
            }
        };

        const interval = setInterval(refreshData, refresh_interval);
        return () => clearInterval(interval);
    }, [refresh_interval, audioEnabled, previousQueue]);

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
            const response = await fetch(`/antrian/api/display/counter/${counter.id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setCounter({
                        ...counter,
                        current_serving: result.data.current_serving,
                        waiting_queues: result.data.waiting_queues,
                        waiting_count: result.data.waiting_count
                    });
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

    const toggleAudio = async () => {
        const newAudioState = !audioEnabled;
        setAudioEnabled(newAudioState);
        localStorage.setItem('counter-audio-enabled', newAudioState.toString());
        
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
        
        setNewlyCalledQueue({
            id: 999999,
            queue_number: 'A001',
            status: 'called',
            room: counter.room,
            counter: counter,
            called_at: new Date().toISOString(),
            served_at: null,
            created_at: new Date().toISOString()
        });
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Head title={`Display Counter ${counter.name} - Sistem Antrian`} />
            
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
                                <MonitorSpeaker className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {counter.name}
                                </h1>
                                <p className="text-gray-600">
                                    {counter.code} • {counter.room.name}
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
                                <a href={`/antrian/display/room/${counter.room.id}`} target="_blank">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Ruangan
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Counter</h2>
                        
                        {/* Quick Stats */}
                        <div className="space-y-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Sedang Dilayani</p>
                                        <p className="text-2xl font-bold text-green-700">{counter.current_serving ? 1 : 0}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Total Menunggu</p>
                                        <p className="text-2xl font-bold text-orange-700">{counter.waiting_count || counter.waiting_queues?.length || 0}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Status Counter</p>
                                        <p className="text-lg font-bold text-blue-700">{counter.current_serving ? 'Aktif' : 'Standby'}</p>
                                    </div>
                                    <MonitorSpeaker className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Counter Info */}
                        <div className="border border-gray-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <MonitorSpeaker className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-900">Informasi Counter</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Kode:</span> {counter.code}</p>
                                <p><span className="font-medium">Nama:</span> {counter.name}</p>
                                <p><span className="font-medium">Ruangan:</span> {counter.room.name}</p>
                                <p><span className="font-medium">Kode Ruangan:</span> {counter.room.code}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Auto Refresh Status */}
                    <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Auto-refresh setiap {refresh_interval / 1000} detik</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Terakhir update: {formatTime(currentTime)}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Main Content Grid - 2 Columns */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Current Serving Section */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                                <CardTitle className="text-xl text-green-800 flex items-center gap-3">
                                    <Activity className="h-6 w-6" />
                                    Sedang Dilayani
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {counter.current_serving ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                            <div className="text-5xl font-bold text-green-800 mb-2">
                                                {counter.current_serving.queue_number}
                                            </div>
                                            {counter.current_serving.called_at && (
                                                <div className="text-sm text-green-600">
                                                    Dipanggil: {formatQueueTime(counter.current_serving.called_at)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        <Timer className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <div className="text-xl font-semibold mb-2">Belum ada antrian dilayani</div>
                                        <div className="text-gray-400">Counter siap melayani antrian</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Waiting Queues Section */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                                <CardTitle className="text-xl text-orange-800 flex items-center gap-3">
                                    <Users className="h-6 w-6" />
                                    Antrian Menunggu ({counter.waiting_count || counter.waiting_queues?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {counter.waiting_queues && counter.waiting_queues.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Next in line */}
                                        {counter.waiting_queues.slice(0, 1).map((queue, index) => (
                                            <div key={queue.id} className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                                <div className="text-center">
                                                    <p className="text-yellow-700 text-sm font-medium mb-2">Antrian Selanjutnya</p>
                                                    <p className="text-3xl font-bold text-yellow-800 mb-2">{queue.queue_number}</p>
                                                    <div className="text-xs text-yellow-600">
                                                        {formatQueueTime(queue.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Other waiting queues */}
                                        {counter.waiting_queues.length > 1 && (
                                            <div>
                                                <p className="text-gray-700 text-sm font-medium mb-3">
                                                    Antrian Lainnya:
                                                </p>
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {counter.waiting_queues.slice(1, 11).map((queue, index) => (
                                                        <div
                                                            key={queue.id}
                                                            className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-center gap-3"
                                                        >
                                                            <div className="text-lg font-bold text-orange-800">
                                                                {queue.queue_number}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs text-orange-600">
                                                                    #{index + 2} • {formatQueueTime(queue.created_at)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {counter.waiting_queues.length > 11 && (
                                                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
                                                            <span className="text-gray-500 text-sm">
                                                                +{counter.waiting_queues.length - 11} antrian lainnya
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        <Timer className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <div className="text-lg font-semibold">Tidak ada antrian menunggu</div>
                                        <div className="text-gray-400 text-sm mt-1">Counter siap menerima antrian baru</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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

            {/* Audio Announcement */}
            {newlyCalledQueue && audioEnabled && audioContextInitialized && (
                <>
                    {console.log('🎵 Rendering AnnouncementSound component:', {
                        queueNumber: newlyCalledQueue.queue_number,
                        counterName: counter.name,
                        roomName: counter.room.name,
                        audioContextInitialized
                    })}
                    <AnnouncementSound
                        queueNumber={newlyCalledQueue.queue_number}
                        counterName={counter.name}
                        roomName={counter.room.name}
                        autoPlay={true}
                        audioContextInitialized={audioContextInitialized}
                        onComplete={() => {
                            console.log('🏁 Announcement completed, clearing newlyCalledQueue');
                            setNewlyCalledQueue(null);
                        }}
                    />
                </>
            )}
        </div>
    );
}
