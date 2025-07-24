import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Room, Counter, QueueStatistics } from "@/types/antrian";
import { Head, router, usePage } from "@inertiajs/react";
import { Building, ArrowLeft, Edit3, Users, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props extends SharedData {
    room: Room;
    statistics: {
        room: Room;
        total_queues: number;
        waiting_queues: number;
        serving_queues: number;
        completed_queues: number;
        cancelled_queues: number;
        active_counters: number;
    };
}

export default function ShowRoom() {
    const { room, statistics } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Antrian',
            href: '/antrian',
        },
        {
            title: <Building />,
            href: '/antrian/rooms',
        },
        {
            title: room.name,
            href: `/antrian/rooms/${room.id}`,
        },
    ];

    const statCards = [
        {
            title: "Total Antrian Hari Ini",
            value: statistics.total_queues,
            icon: Activity,
            color: "bg-blue-500"
        },
        {
            title: "Sedang Menunggu",
            value: statistics.waiting_queues,
            icon: Clock,
            color: "bg-yellow-500"
        },
        {
            title: "Sedang Dilayani",
            value: statistics.serving_queues,
            icon: Users,
            color: "bg-green-500"
        },
        {
            title: "Selesai",
            value: statistics.completed_queues,
            icon: CheckCircle,
            color: "bg-blue-600"
        },
        {
            title: "Dibatalkan",
            value: statistics.cancelled_queues,
            icon: XCircle,
            color: "bg-red-500"
        },
        {
            title: "Loket Aktif",
            value: statistics.active_counters,
            icon: Building,
            color: "bg-purple-500"
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Ruangan - ${room.name}`} />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Detail Ruangan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Informasi lengkap ruangan {room.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(`/antrian/rooms/${room.id}/edit`)}
                            className="flex items-center gap-2"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/antrian/rooms')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Room Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Ruangan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Nama Ruangan</Label>
                                    <p className="text-lg font-semibold">{room.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Kode Ruangan</Label>
                                    <Badge variant="outline" className="text-lg">{room.code}</Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Prefix Antrian</Label>
                                    <Badge variant="secondary" className="text-lg">{room.prefix}</Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <Badge variant={room.is_active ? "default" : "secondary"}>
                                        {room.is_active ? "Aktif" : "Tidak Aktif"}
                                    </Badge>
                                </div>
                                {room.description && (
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Deskripsi</Label>
                                        <p className="text-sm">{room.description}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Hari Ini</CardTitle>
                            <CardDescription>
                                Data antrian untuk tanggal {new Date().toLocaleDateString('id-ID')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {statCards.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`inline-flex p-3 rounded-full text-white mb-2 ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Counters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Loket</CardTitle>
                            <CardDescription>
                                Loket yang tersedia di ruangan ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {room.active_counters && room.active_counters.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama Loket</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Antrian Menunggu</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {room.active_counters.map((counter) => (
                                                <TableRow key={counter.id}>
                                                    <TableCell>
                                                        <Badge variant="outline">{counter.code}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{counter.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{counter.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={counter.is_active ? "default" : "secondary"}>
                                                            {counter.is_active ? "Aktif" : "Tidak Aktif"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            {counter.waiting_count || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/antrian/counters/${counter.id}`)}
                                                        >
                                                            Detail
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada loket yang tersedia</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => router.visit('/antrian/counters/create')}
                                    >
                                        Tambah Loket
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

// Import Label component
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label className={className} {...props}>
            {children}
        </label>
    );
}
