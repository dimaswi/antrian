import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, router } from "@inertiajs/react";
import { UserCheck, Play, Square, SkipForward, RotateCcw, Users, Clock, Activity, AlertCircle, MonitorSpeaker, Building, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    called_by?: {
        id: number;
        name: string;
    };
    served_at: string | null;
}

interface CounterStatus {
    counter: Counter;
    current_serving: Queue | null;
    next_waiting: Queue | null;
    waiting_queues: Queue[];
    served_queues: Queue[];
    statistics: {
        total_today: number;
        completed_today: number;
        average_service_time: number;
    };
}

interface Props {
    counters: Counter[];
    selectedCounterId?: number;
}

export default function OperatorDashboard({ counters = [], selectedCounterId }: Props) {
    const [selectedCounter, setSelectedCounter] = useState<number>(selectedCounterId || (counters.length > 0 ? counters[0].id : 0));
    const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'waiting' | 'served'>('waiting');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Antrian',
            href: '/antrian',
        },
        {
            title: <UserCheck />,
            href: '/antrian/operator',
        },
        {
            title: 'Dashboard Operator',
            href: '/antrian/operator',
        },
    ];

    // Load counter status
    const loadCounterStatus = async (counterId: number) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/antrian/api/operator/counter/${counterId}/status`);
            const result = await response.json();
            
            if (result.success) {
                setCounterStatus(result);
            } else {
                console.error('Failed to load counter status:', result.message);
                toast.error(result.message || 'Gagal memuat status loket');
            }
        } catch (error) {
            console.error('Failed to load counter status:', error);
            toast.error('Gagal memuat status loket');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto refresh data every 10 seconds
    useEffect(() => {
        if (selectedCounter) {
            loadCounterStatus(selectedCounter);
            const interval = setInterval(() => {
                loadCounterStatus(selectedCounter);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedCounter]);

    // Handle counter selection change
    const handleCounterChange = (counterId: string) => {
        const id = parseInt(counterId);
        setSelectedCounter(id);
        router.visit(`/antrian/operator?counter=${id}`, { preserveState: true });
    };

    // Call next queue
    const handleCallNext = async () => {
        if (!selectedCounter) return;
        
        try {
            setActionLoading('call-next');
            const response = await fetch('/antrian/operator/call-next', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    counter_id: selectedCounter,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Antrian ${result.queue.queue_number} berhasil dipanggil`);
                loadCounterStatus(selectedCounter);
            } else {
                toast.error(result.message || 'Gagal memanggil antrian berikutnya');
            }
        } catch (error) {
            console.error('Error calling next queue:', error);
            toast.error('Terjadi kesalahan saat memanggil antrian');
        } finally {
            setActionLoading(null);
        }
    };

    // Start serving current queue
    const handleStartServing = async (queueId: number) => {
        try {
            setActionLoading('start-serving');
            const response = await fetch(`/antrian/operator/queue/${queueId}/start-serving`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Mulai melayani pasien');
                loadCounterStatus(selectedCounter);
            } else {
                toast.error(result.message || 'Gagal memulai layanan');
            }
        } catch (error) {
            console.error('Error starting service:', error);
            toast.error('Terjadi kesalahan saat memulai layanan');
        } finally {
            setActionLoading(null);
        }
    };

    // Complete current queue
    const handleComplete = async (queueId: number) => {
        try {
            setActionLoading('complete');
            const response = await fetch(`/antrian/operator/queue/${queueId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Antrian selesai dilayani');
                loadCounterStatus(selectedCounter);
            } else {
                toast.error(result.message || 'Gagal menyelesaikan antrian');
            }
        } catch (error) {
            console.error('Error completing queue:', error);
            toast.error('Terjadi kesalahan saat menyelesaikan antrian');
        } finally {
            setActionLoading(null);
        }
    };

    // Skip current queue
    const handleSkip = async (queueId: number) => {
        try {
            setActionLoading('skip');
            const response = await fetch(`/antrian/operator/queue/${queueId}/skip`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Antrian berhasil dilewati');
                loadCounterStatus(selectedCounter);
            } else {
                toast.error(result.message || 'Gagal melewati antrian');
            }
        } catch (error) {
            console.error('Error skipping queue:', error);
            toast.error('Terjadi kesalahan saat melewati antrian');
        } finally {
            setActionLoading(null);
        }
    };

    // Recall queue
    const handleRecall = async (queueId: number) => {
        // Konfirmasi sebelum panggil ulang
        const confirm = window.confirm(
            'Apakah Anda yakin ingin memanggil ulang antrian ini? Pengumuman akan diputar ulang di speaker.'
        );
        
        if (!confirm) return;

        try {
            setActionLoading('recall');
            const response = await fetch(`/antrian/operator/queue/${queueId}/recall`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Antrian berhasil dipanggil ulang');
                loadCounterStatus(selectedCounter);
            } else {
                toast.error(result.message || 'Gagal memanggil ulang antrian');
            }
        } catch (error) {
            console.error('Error recalling queue:', error);
            toast.error('Terjadi kesalahan saat memanggil ulang antrian');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            waiting: { label: 'Menunggu', variant: 'secondary' as const },
            called: { label: 'Dipanggil', variant: 'default' as const },
            serving: { label: 'Dilayani', variant: 'default' as const },
            completed: { label: 'Selesai', variant: 'outline' as const },
            cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    };

    // Helper function to calculate time since last call
    const getTimeSinceCall = (calledAt: string | null) => {
        if (!calledAt) return null;
        const callTime = new Date(calledAt);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Baru saja';
        if (diffMinutes === 1) return '1 menit yang lalu';
        if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return '1 jam yang lalu';
        return `${diffHours} jam yang lalu`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Operator" />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <UserCheck className="h-6 w-6" />
                            Dashboard Operator
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola antrian dan layani pasien
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/antrian/operator/compact" target="_blank">
                                <MonitorSpeaker className="h-4 w-4 mr-2" />
                                Tampilan Compact
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Counter Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Pilih Loket</CardTitle>
                        <CardDescription>
                            Pilih loket yang akan Anda operasikan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedCounter.toString()} onValueChange={handleCounterChange}>
                            <SelectTrigger className="w-full max-w-md">
                                <SelectValue placeholder="Pilih loket" />
                            </SelectTrigger>
                            <SelectContent>
                                {counters?.map((counter) => (
                                    <SelectItem key={counter.id} value={counter.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <MonitorSpeaker className="h-4 w-4" />
                                            <span>{counter.name} ({counter.code})</span>
                                            <span className="text-muted-foreground">- {counter.room?.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>Memuat data loket...</p>
                    </div>
                ) : counterStatus && counterStatus.counter ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Current Status */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Counter Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MonitorSpeaker className="h-5 w-5" />
                                        {counterStatus.counter.name}
                                    </CardTitle>
                                    <CardDescription>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            {counterStatus.counter.room?.name} ({counterStatus.counter.room?.code})
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {/* Current Serving */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Sedang Dilayani
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {counterStatus.current_serving ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <div className="text-3xl font-bold text-green-700 font-mono">
                                                            {counterStatus.current_serving.queue_number}
                                                        </div>
                                                        <div className="text-xs text-green-500 mt-1">
                                                            Dipanggil: {counterStatus.current_serving.called_at ? 
                                                                new Date(counterStatus.current_serving.called_at).toLocaleTimeString('id-ID') : '-'}
                                                            {counterStatus.current_serving.called_at && (
                                                                <span className="ml-2 text-gray-400">
                                                                    ({getTimeSinceCall(counterStatus.current_serving.called_at)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant={getStatusBadge(counterStatus.current_serving.status).variant}>
                                                        {getStatusBadge(counterStatus.current_serving.status).label}
                                                    </Badge>
                                                </div>

                                                <div className="flex gap-2">
                                                    {counterStatus.current_serving.status === 'called' && (
                                                        <Button
                                                            onClick={() => handleStartServing(counterStatus.current_serving!.id)}
                                                            disabled={actionLoading === 'start-serving'}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            <Play className="mr-2 h-4 w-4" />
                                                            Mulai Layani
                                                        </Button>
                                                    )}
                                                    {counterStatus.current_serving.status === 'serving' && (
                                                        <Button
                                                            onClick={() => handleComplete(counterStatus.current_serving!.id)}
                                                            disabled={actionLoading === 'complete'}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Square className="mr-2 h-4 w-4" />
                                                            Selesai
                                                        </Button>
                                                    )}
                                                    {counterStatus.current_serving.status === 'called' && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleRecall(counterStatus.current_serving!.id)}
                                                            disabled={actionLoading === 'recall'}
                                                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                                            title={`Panggil ulang ${counterStatus.current_serving.queue_number} - Pengumuman akan diputar ulang di speaker`}
                                                        >
                                                            <RotateCcw className={`mr-2 h-4 w-4 ${actionLoading === 'recall' ? 'animate-spin' : ''}`} />
                                                            Panggil Ulang
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleSkip(counterStatus.current_serving!.id)}
                                                        disabled={actionLoading === 'skip'}
                                                    >
                                                        <SkipForward className="mr-2 h-4 w-4" />
                                                        Lewati
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-500">Tidak ada antrian yang sedang dilayani</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Next Queue */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Antrian Berikutnya
                                        </div>
                                        <Button
                                            onClick={handleCallNext}
                                            disabled={!counterStatus.next_waiting || actionLoading === 'call-next'}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Panggil Berikutnya
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {counterStatus.next_waiting ? (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-700 font-mono">
                                                {counterStatus.next_waiting.queue_number}
                                            </div>
                                            <div className="text-xs text-orange-500 mt-1">
                                                Terdaftar: {new Date(counterStatus.next_waiting.created_at).toLocaleTimeString('id-ID')}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-500">Tidak ada antrian berikutnya</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistik Hari Ini</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Total Antrian</span>
                                        <span className="font-bold">{counterStatus.statistics?.total_today || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Selesai Dilayani</span>
                                        <span className="font-bold text-green-600">{counterStatus.statistics?.completed_today || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Rata-rata Layanan</span>
                                        <span className="font-bold">{Math.round(counterStatus.statistics?.average_service_time || 0)} menit</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Queue Management with Tabs */}
                            <Card>
                                <CardHeader>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={activeTab === 'waiting' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveTab('waiting')}
                                            className="text-sm"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Menunggu ({counterStatus.waiting_queues?.length || 0})
                                        </Button>
                                        <Button
                                            variant={activeTab === 'served' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveTab('served')}
                                            className="text-sm"
                                        >
                                            <History className="h-4 w-4 mr-2" />
                                            Riwayat ({counterStatus.served_queues?.length || 0})
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {activeTab === 'waiting' ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {(counterStatus.waiting_queues?.length || 0) > 0 ? (
                                                counterStatus.waiting_queues?.slice(0, 10).map((queue, index) => (
                                                    <div
                                                        key={queue.id}
                                                        className={`p-2 rounded border ${
                                                            index === 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="font-mono font-semibold">
                                                            {queue.queue_number}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(queue.created_at).toLocaleTimeString('id-ID')}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-gray-500 py-4">
                                                    Tidak ada antrian menunggu
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {(counterStatus.served_queues?.length || 0) > 0 ? (
                                                counterStatus.served_queues?.slice(0, 20).map((queue) => (
                                                    <div
                                                        key={queue.id}
                                                        className="p-3 rounded border bg-gray-50 border-gray-200"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-mono font-semibold">
                                                                    {queue.queue_number}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Dipanggil: {queue.called_at ? new Date(queue.called_at).toLocaleTimeString('id-ID') : '-'}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge 
                                                                    variant={
                                                                        queue.status === 'completed' ? 'default' : 
                                                                        queue.status === 'serving' ? 'secondary' : 
                                                                        'outline'
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {queue.status === 'called' ? 'Dipanggil' :
                                                                     queue.status === 'serving' ? 'Dilayani' :
                                                                     queue.status === 'completed' ? 'Selesai' : 
                                                                     queue.status === 'cancelled' ? 'Dibatalkan' : queue.status}
                                                                </Badge>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {queue.called_by?.name || `User ${queue.called_by?.id || '-'}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-gray-500 py-4">
                                                    Belum ada riwayat hari ini
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Pilih loket untuk memulai</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
