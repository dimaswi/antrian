import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, MapPin, MonitorSpeaker, Clock, User, Calendar, Activity, CheckCircle, XCircle, Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface CalledBy {
    id: number;
    name: string;
}

interface Queue {
    id: number;
    queue_number: string;
    room_id: number;
    counter_id: number;
    status: string;
    queue_date: string;
    created_at: string;
    called_at: string | null;
    served_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    notes: string | null;
    room: Room;
    counter: Counter;
    calledBy?: CalledBy;
    patient_name?: string;
    patient_type?: string;
}

interface Statistics {
    total_queues: number;
    waiting_queues: number;
    serving_queues: number;
    completed_queues: number;
}

interface Props extends SharedData {
    queue: Queue;
    statistics: Statistics;
    queuePosition: number | null;
}

const statusConfig = {
    waiting: {
        label: 'Menunggu',
        variant: 'secondary' as const,
        icon: Timer
    },
    called: {
        label: 'Dipanggil',
        variant: 'default' as const,
        icon: AlertCircle
    },
    serving: {
        label: 'Dilayani',
        variant: 'default' as const,
        icon: Activity
    },
    completed: {
        label: 'Selesai',
        variant: 'default' as const,
        icon: CheckCircle
    },
    cancelled: {
        label: 'Dibatalkan',
        variant: 'destructive' as const,
        icon: XCircle
    }
};

export default function QueueShow({ queue, statistics, queuePosition }: Props) {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/" },
        { title: "Antrian", href: "/antrian" },
        { title: "Daftar Antrian", href: "/antrian/queues" },
        { title: `Antrian ${queue.queue_number}`, href: "#" },
    ];

    const statusInfo = statusConfig[queue.status as keyof typeof statusConfig];
    const StatusIcon = statusInfo?.icon || Timer;

    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateWaitingTime = () => {
        if (!queue.created_at) return '-';
        
        const startTime = new Date(queue.created_at);
        const endTime = queue.served_at ? new Date(queue.served_at) : new Date();
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 60) {
            return `${diffMinutes} menit`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours} jam ${minutes} menit`;
        }
    };

    const calculateServiceTime = () => {
        if (!queue.served_at || !queue.completed_at) return '-';
        
        const startTime = new Date(queue.served_at);
        const endTime = new Date(queue.completed_at);
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 60) {
            return `${diffMinutes} menit`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours} jam ${minutes} menit`;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title={`Antrian ${queue.queue_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/antrian/queues">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Antrian {queue.queue_number}</h1>
                            <p className="text-muted-foreground">Detail informasi antrian</p>
                        </div>
                    </div>

                    <Badge variant={statusInfo?.variant || 'secondary'} className="h-8 px-3">
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {statusInfo?.label || queue.status}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Queue Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Informasi Antrian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Nomor Antrian</label>
                                    <p className="text-2xl font-bold text-primary">{queue.queue_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">
                                        <Badge variant={statusInfo?.variant || 'secondary'}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {statusInfo?.label || queue.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Ruangan
                                    </span>
                                    <span className="font-medium">{queue.room.name} ({queue.room.code})</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                                        <MonitorSpeaker className="h-4 w-4 mr-2" />
                                        Loket
                                    </span>
                                    <span className="font-medium">{queue.counter.name} ({queue.counter.code})</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Tanggal
                                    </span>
                                    <span className="font-medium">{formatDate(queue.queue_date)}</span>
                                </div>

                                {queuePosition && queuePosition > 0 && queue.status === 'waiting' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Posisi dalam Antrian</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                #{queuePosition}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {queuePosition === 1 ? 'Antrian berikutnya' : `${queuePosition - 1} antrian lagi`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {queue.status !== 'waiting' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Status Saat Ini</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={statusInfo?.variant || 'secondary'}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusInfo?.label || queue.status}
                                            </Badge>
                                            {queue.status === 'serving' && (
                                                <span className="text-xs text-green-600 font-medium">Sedang dilayani</span>
                                            )}
                                            {queue.status === 'completed' && (
                                                <span className="text-xs text-gray-600">Pelayanan selesai</span>
                                            )}
                                            {queue.status === 'cancelled' && (
                                                <span className="text-xs text-red-600">Antrian dibatalkan</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {queue.patient_name && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Nama Pasien</span>
                                        <span className="font-medium">{queue.patient_name}</span>
                                    </div>
                                )}

                                {queue.patient_type && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Jenis Pasien</span>
                                        <span className="font-medium">{queue.patient_type}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Timeline Antrian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {/* Created */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Antrian Dibuat</p>
                                        <p className="text-xs text-muted-foreground">{formatTime(queue.created_at)}</p>
                                    </div>
                                </div>

                                {/* Called */}
                                {queue.called_at && (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Antrian Dipanggil</p>
                                            <p className="text-xs text-muted-foreground">{formatTime(queue.called_at)}</p>
                                            {queue.calledBy && (
                                                <p className="text-xs text-muted-foreground">oleh {queue.calledBy.name}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Served */}
                                {queue.served_at && (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Mulai Dilayani</p>
                                            <p className="text-xs text-muted-foreground">{formatTime(queue.served_at)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Completed or Cancelled */}
                                {queue.completed_at && (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Antrian Selesai</p>
                                            <p className="text-xs text-muted-foreground">{formatTime(queue.completed_at)}</p>
                                        </div>
                                    </div>
                                )}

                                {queue.cancelled_at && (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                                            <XCircle className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Antrian Dibatalkan</p>
                                            <p className="text-xs text-muted-foreground">{formatTime(queue.cancelled_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Timing Information */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Waktu Menunggu</span>
                                    <span className="text-sm font-medium">{calculateWaitingTime()}</span>
                                </div>
                                
                                {queue.served_at && queue.completed_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Waktu Pelayanan</span>
                                        <span className="text-sm font-medium">{calculateServiceTime()}</span>
                                    </div>
                                )}
                            </div>

                            {queue.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                                        <p className="mt-1 text-sm">{queue.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Statistik Hari Ini - {queue.room.name}</CardTitle>
                            <CardDescription>
                                Ringkasan antrian untuk ruangan {queue.room.name} pada {formatDate(queue.queue_date)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{statistics.total_queues}</div>
                                    <div className="text-sm text-muted-foreground">Total Antrian</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{statistics.waiting_queues}</div>
                                    <div className="text-sm text-muted-foreground">Menunggu</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{statistics.serving_queues}</div>
                                    <div className="text-sm text-muted-foreground">Dilayani</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">{statistics.completed_queues}</div>
                                    <div className="text-sm text-muted-foreground">Selesai</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
