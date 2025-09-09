import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, router } from "@inertiajs/react";
import { UserCheck, Play, Square, SkipForward, RotateCcw, Users, Clock, Activity, AlertCircle, MonitorSpeaker, Building, RefreshCw, Timer, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    waiting_count: number;
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

export default function CompactOperatorDashboard({ counters = [], selectedCounterId }: Props) {
    const [selectedCounter, setSelectedCounter] = useState<number>(selectedCounterId || (counters.length > 0 ? counters[0].id : 0));
    const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
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

    // Refresh only queue data (for table refresh)
    const refreshQueueData = async () => {
        if (!selectedCounter) return;
        
        try {
            setIsRefreshing(true);
            const response = await fetch(`/antrian/api/operator/counter/${selectedCounter}/status`);
            const result = await response.json();
            
            if (result.success) {
                setCounterStatus(result);
            }
        } catch (error) {
            console.error('Failed to refresh queue data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Auto refresh data every 5 seconds
    useEffect(() => {
        if (selectedCounter) {
            loadCounterStatus(selectedCounter);
            const interval = setInterval(() => {
                refreshQueueData(); // Use refreshQueueData for auto-refresh
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedCounter]);

    // Handle counter selection change
    const handleCounterChange = (counterId: number) => {
        setSelectedCounter(counterId);
        router.visit(`/antrian/operator/compact?counter=${counterId}`, { preserveState: true });
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
                toast.success(`Antrian ${result.data.queue_number} berhasil dipanggil`);
                refreshQueueData(); // Use refreshQueueData instead of full reload
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
                refreshQueueData(); // Use refreshQueueData instead of full reload
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

    // Complete queue
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
                toast.success('Antrian berhasil diselesaikan');
                refreshQueueData(); // Use refreshQueueData instead of full reload
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

    // Skip queue
    const handleSkip = async (queueId: number) => {
        const reason = prompt('Alasan melewati antrian:');
        if (!reason) return;

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
                body: JSON.stringify({ reason }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Antrian berhasil dilewati');
                refreshQueueData(); // Use refreshQueueData instead of full reload
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
                refreshQueueData(); // Use refreshQueueData instead of full reload
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
            waiting: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
            called: { label: 'Dipanggil', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
            serving: { label: 'Dilayani', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
            completed: { label: 'Selesai', variant: 'outline' as const, color: 'bg-green-50 text-green-700' },
            cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Dashboard - Sistem Antrian" />

            <div className="flex h-[calc(100vh-120px)] gap-4 py-4">
                {/* Sidebar - Counter Selection */}
                <div className="w-80 bg-white rounded-lg shadow-sm border flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-lg font-semibold">Pilih Loket</h2>
                    </div>
                    
                    {/* Scrollable Counter List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {counters.map((counter) => (
                                <button
                                    key={counter.id}
                                    onClick={() => handleCounterChange(counter.id)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                        selectedCounter === counter.id
                                            ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MonitorSpeaker className={`h-5 w-5 ${
                                            selectedCounter === counter.id ? 'text-blue-600' : 'text-gray-500'
                                        }`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium truncate">{counter.name}</div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {counter.room.name} - {counter.code}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats - Fixed at bottom */}
                    {counterStatus && (
                        <div className="border-t bg-gray-50 p-4 flex-shrink-0">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Statistik Hari Ini</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">{counterStatus.statistics?.total_today || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Selesai:</span>
                                    <span className="font-medium text-green-600">{counterStatus.statistics?.completed_today || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Menunggu:</span>
                                    <span className="font-medium text-orange-600">{counterStatus.waiting_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500">Memuat data loket...</p>
                            </div>
                        </div>
                    ) : counterStatus && counterStatus.counter ? (
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">
                                            {counterStatus.counter.name}
                                        </h1>
                                        <p className="text-gray-600">
                                            {counterStatus.counter.room.name} - {counterStatus.counter.code}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right text-sm">
                                            <div className="text-gray-500">Terakhir Update</div>
                                            <div className="font-mono text-gray-900">
                                                {new Date().toLocaleTimeString('id-ID')}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={refreshQueueData} // Use refreshQueueData for manual refresh
                                            disabled={isRefreshing}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href="/antrian/operator" target="_blank">
                                                Classic View
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Current Serving & Quick Actions */}
                            <div className="border-b bg-white px-6 py-4">
                                {counterStatus.current_serving ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-700 font-mono">
                                                    {counterStatus.current_serving.queue_number}
                                                </div>
                                                <div className="text-sm text-gray-500">Sedang Dilayani</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">
                                                    Dipanggil: {counterStatus.current_serving.called_at ? 
                                                        formatTime(counterStatus.current_serving.called_at) : '-'}
                                                </div>
                                                <Badge className={getStatusBadge(counterStatus.current_serving.status).color}>
                                                    {getStatusBadge(counterStatus.current_serving.status).label}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {counterStatus.current_serving.status === 'called' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleStartServing(counterStatus.current_serving!.id)}
                                                        disabled={actionLoading === 'start-serving'}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Mulai Layani
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleRecall(counterStatus.current_serving!.id)}
                                                        disabled={actionLoading === 'recall'}
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Panggil Ulang
                                                    </Button>
                                                </>
                                            )}
                                            {counterStatus.current_serving.status === 'serving' && (
                                                <Button
                                                    onClick={() => handleComplete(counterStatus.current_serving!.id)}
                                                    disabled={actionLoading === 'complete'}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Selesai
                                                </Button>
                                            )}
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleSkip(counterStatus.current_serving!.id)}
                                                disabled={actionLoading === 'skip'}
                                            >
                                                <SkipForward className="h-4 w-4 mr-2" />
                                                Lewati
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-400 font-mono">---</div>
                                                <div className="text-sm text-gray-500">Tidak Ada</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-500">Loket tersedia</div>
                                                <div className="text-sm text-gray-400">Siap melayani antrian berikutnya</div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleCallNext}
                                            disabled={!counterStatus.next_waiting || actionLoading === 'call-next'}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            size="lg"
                                        >
                                            <Play className="h-5 w-5 mr-2" />
                                            Panggil Antrian Berikutnya
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Queue Table with Tabs */}
                            <div className="flex-1 overflow-auto">
                                {/* Tab Headers */}
                                <div className="border-b bg-gray-50 px-4 py-2">
                                    <div className="flex gap-1">
                                        <Button
                                            variant={activeTab === 'waiting' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveTab('waiting')}
                                            className="text-sm"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Menunggu ({counterStatus.waiting_count || 0})
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
                                </div>

                                {/* Tab Content */}
                                <div className="p-4">
                                    {activeTab === 'waiting' ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">No. Antrian</TableHead>
                                                    <TableHead className="w-[120px]">Status</TableHead>
                                                    <TableHead className="w-[100px]">Waktu</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {counterStatus.waiting_queues && counterStatus.waiting_queues.length > 0 ? (
                                                    counterStatus.waiting_queues.map((queue, index) => (
                                                        <TableRow key={queue.id} className={index === 0 ? 'bg-orange-50' : ''}>
                                                            <TableCell className="font-mono font-bold">
                                                                {queue.queue_number}
                                                                {index === 0 && (
                                                                    <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                                                                        Berikutnya
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusBadge(queue.status).color}>
                                                                    {getStatusBadge(queue.status).label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-500">
                                                                {formatTime(queue.created_at)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-8">
                                                            <div className="text-gray-500">
                                                                <Timer className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                                <p className="text-lg font-medium">Tidak ada antrian menunggu</p>
                                                                <p className="text-sm">Semua antrian sudah dilayani</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">No. Antrian</TableHead>
                                                    <TableHead className="w-[120px]">Status</TableHead>
                                                    <TableHead className="w-[100px]">Waktu Panggil</TableHead>
                                                    <TableHead className="w-[100px]">Operator</TableHead>
                                                    <TableHead className="w-[150px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {counterStatus.served_queues && counterStatus.served_queues.length > 0 ? (
                                                    counterStatus.served_queues.map((queue) => (
                                                        <TableRow key={queue.id}>
                                                            <TableCell className="font-mono font-bold">
                                                                {queue.queue_number}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusBadge(queue.status).color}>
                                                                    {getStatusBadge(queue.status).label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-500">
                                                                {queue.called_at ? formatTime(queue.called_at) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-500">
                                                                {queue.called_by?.name || `User ${queue.called_by?.id || '-'}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                {(queue.status === 'completed' || queue.status === 'cancelled') && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleRecall(queue.id)}
                                                                        disabled={actionLoading === 'recall'}
                                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                    >
                                                                        <RotateCcw className="h-3 w-3 mr-1" />
                                                                        Panggil Ulang
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8">
                                                            <div className="text-gray-500">
                                                                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                                <p className="text-lg font-medium">Belum ada riwayat hari ini</p>
                                                                <p className="text-sm">Antrian yang sudah dipanggil akan muncul disini</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <MonitorSpeaker className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Pilih Loket</p>
                                <p className="text-sm">Pilih loket dari sidebar untuk mulai bekerja</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
