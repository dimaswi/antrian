import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { LayoutGrid, Plus, Filter, Search, Users, Clock, Activity, TrendingUp, Building, MonitorSpeaker, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermission } from "@/hooks/use-permission";
import { useState } from "react";

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
    room_id: number;
    counter_id: number;
    status: string;
    created_at: string;
    called_at: string | null;
    served_at: string | null;
    completed_at: string | null;
    room: Room;
    counter: Counter;
    patient_name?: string;
    patient_type?: string;
}

interface Statistics {
    total_queues: number;
    waiting_queues: number;
    serving_queues: number;
    completed_queues: number;
    cancelled_queues: number;
    average_waiting_time: number;
}

interface Props {
    queues: {
        data: Queue[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statistics: Statistics;
    rooms: Room[];
    counters: Counter[];
    filters: {
        search?: string;
        status?: string;
        room_id?: string;
        counter_id?: string;
        date?: string;
    };
}

export default function QueueIndex({ queues, statistics, rooms = [], counters = [], filters }: Props) {
    const { hasPermission } = usePermission();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    
    // Default statistics if not provided
    const safeStatistics = statistics || {
        total_queues: 0,
        waiting_queues: 0,
        serving_queues: 0,
        completed_queues: 0,
        cancelled_queues: 0,
        average_waiting_time: 0,
    };

    // Default queues if not provided
    const safeQueues = {
        data: queues?.data || [],
        current_page: queues?.current_page || 1,
        last_page: queues?.last_page || 1,
        per_page: queues?.per_page || 10,
        total: queues?.total || 0,
    };

    // Ensure data is always an array
    const safeQueueData = Array.isArray(safeQueues.data) ? safeQueues.data : [];
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Antrian',
            href: '/antrian',
        },
        {
            title: <LayoutGrid />,
            href: '/antrian/queues',
        },
        {
            title: 'Queue Management',
            href: '/antrian/queues',
        },
    ];

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1'); // Reset to first page
        router.get(`/antrian/queues?${params.toString()}`);
    };

    const handleSearch = () => {
        handleFilter('search', searchTerm);
    };

    const handleRefresh = () => {
        router.reload();
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

    const getPatientTypeBadge = (type: string) => {
        const typeMap = {
            general: { label: 'Umum', variant: 'default' as const },
            bpjs: { label: 'BPJS', variant: 'secondary' as const },
            vip: { label: 'VIP', variant: 'destructive' as const },
        };
        return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
    };

    const statCards = [
        {
            title: 'Total Antrian Hari Ini',
            value: safeStatistics.total_queues,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Menunggu',
            value: safeStatistics.waiting_queues,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Sedang Dilayani',
            value: safeStatistics.serving_queues,
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Selesai',
            value: safeStatistics.completed_queues,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Queue Management" />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <LayoutGrid className="h-6 w-6" />
                            Queue Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola dan monitor semua antrian dalam sistem
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        {hasPermission('queue.create') && (
                            <Link href="/antrian/kiosk">
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Tambah Antrian
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Cari nomor antrian atau nama pasien..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <Select value={filters?.status || 'all'} onValueChange={(value) => handleFilter('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="waiting">Menunggu</SelectItem>
                                    <SelectItem value="called">Dipanggil</SelectItem>
                                    <SelectItem value="serving">Dilayani</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Room Filter */}
                            <Select value={filters?.room_id || 'all'} onValueChange={(value) => handleFilter('room_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Ruangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Ruangan</SelectItem>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.name} ({room.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Counter Filter */}
                            <Select value={filters?.counter_id || 'all'} onValueChange={(value) => handleFilter('counter_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Loket" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Loket</SelectItem>
                                    {counters.map((counter) => (
                                        <SelectItem key={counter.id} value={counter.id.toString()}>
                                            {counter.name} ({counter.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Queue Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Antrian</CardTitle>
                        <CardDescription>
                            Menampilkan {safeQueueData.length} dari {safeQueues.total} antrian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nomor Antrian</TableHead>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Loket</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tipe Pasien</TableHead>
                                        <TableHead>Waktu Daftar</TableHead>
                                        <TableHead>Waktu Dipanggil</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeQueueData.length > 0 ? (
                                        safeQueueData.map((queue) => {
                                            const statusInfo = getStatusBadge(queue?.status || 'waiting');
                                            const patientTypeInfo = queue?.patient_type ? getPatientTypeBadge(queue.patient_type) : null;
                                            
                                            return (
                                                <TableRow key={queue?.id || Math.random()}>
                                                    <TableCell>
                                                        <div className="font-mono font-semibold">
                                                            {queue?.queue_number || 'N/A'}
                                                        </div>
                                                        {queue?.patient_name && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {queue.patient_name}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium">{queue.room?.name || 'N/A'}</div>
                                                                <div className="text-xs text-muted-foreground">{queue.room?.code || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MonitorSpeaker className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium">{queue.counter?.name || 'N/A'}</div>
                                                                <div className="text-xs text-muted-foreground">{queue.counter?.code || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {patientTypeInfo && (
                                                            <Badge variant={patientTypeInfo.variant}>{patientTypeInfo.label}</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {queue?.created_at ? new Date(queue.created_at).toLocaleString('id-ID') : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {queue?.called_at ? (
                                                            <div className="text-sm">
                                                                {new Date(queue.called_at).toLocaleString('id-ID')}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/antrian/queues/${queue.id}`}>
                                                                    <Eye className="h-3 w-3" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-muted-foreground">Tidak ada antrian ditemukan</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {safeQueues.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {((safeQueues.current_page - 1) * safeQueues.per_page) + 1} - {Math.min(safeQueues.current_page * safeQueues.per_page, safeQueues.total)} dari {safeQueues.total} antrian
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: safeQueues.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === safeQueues.current_page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                const params = new URLSearchParams(window.location.search);
                                                params.set('page', page.toString());
                                                router.get(`/antrian/queues?${params.toString()}`);
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
