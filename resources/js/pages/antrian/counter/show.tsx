import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { MonitorSpeaker, ArrowLeft, Edit3, Building, Users, Clock, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePermission } from "@/hooks/use-permission";

interface Room {
    id: number;
    name: string;
    code: string;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    description: string;
    room_id: number;
    type: string;
    is_active: boolean;
    room: Room;
    created_at: string;
    updated_at: string;
}

interface Statistics {
    total_queues: number;
    waiting_queues: number;
    serving_queues: number;
    completed_queues: number;
    cancelled_queues: number;
    current_serving: any;
    next_waiting: any;
}

interface Props {
    counter: Counter;
    statistics: Statistics;
}

export default function ShowCounter({ counter, statistics }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Antrian',
            href: '/antrian',
        },
        {
            title: <MonitorSpeaker />,
            href: '/antrian/counters',
        },
        {
            title: counter.name,
            href: `/antrian/counters/${counter.id}`,
        },
    ];

    const getTypeLabel = (type: string) => {
        const types = {
            general: { label: 'General', variant: 'default' as const },
            bpjs: { label: 'BPJS', variant: 'secondary' as const },
            vip: { label: 'VIP', variant: 'destructive' as const },
            emergency: { label: 'Emergency', variant: 'destructive' as const },
        };
        return types[type as keyof typeof types] || { label: type, variant: 'outline' as const };
    };

    const typeInfo = getTypeLabel(counter.type);

    const statCards = [
        {
            title: 'Total Antrian Hari Ini',
            value: statistics.total_queues,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Menunggu',
            value: statistics.waiting_queues,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Sedang Dilayani',
            value: statistics.serving_queues,
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Selesai',
            value: statistics.completed_queues,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Loket - ${counter.name}`} />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <MonitorSpeaker className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">{counter.name}</h1>
                                <p className="text-muted-foreground">
                                    Kode: {counter.code} • {counter.room.name}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                        {hasPermission('counter.edit') && (
                            <Link href={`/antrian/counters/${counter.id}/edit`}>
                                <Button className="flex items-center gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Counter Information */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Loket</CardTitle>
                                <CardDescription>
                                    Detail informasi loket {counter.code}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Nama Loket</Label>
                                    <p className="font-semibold">{counter.name}</p>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Kode Loket</Label>
                                    <p className="font-mono font-semibold">{counter.code}</p>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Ruangan</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">{counter.room.name}</span>
                                        <Badge variant="outline">{counter.room.code}</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tipe Loket</Label>
                                    <div className="mt-1">
                                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={counter.is_active ? "default" : "secondary"}>
                                            {counter.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </Badge>
                                    </div>
                                </div>

                                {counter.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Deskripsi</Label>
                                            <p className="text-sm mt-1">{counter.description}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Dibuat</Label>
                                    <p className="text-sm mt-1">
                                        {new Date(counter.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Statistics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Saat Ini</CardTitle>
                                <CardDescription>
                                    Informasi antrian yang sedang berlangsung
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {statistics.current_serving ? (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-700">Sedang Dilayani</span>
                                        </div>
                                        <p className="text-lg font-bold text-green-900">
                                            {statistics.current_serving.queue_number}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            Dipanggil: {new Date(statistics.current_serving.called_at).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-5 w-5 text-gray-500" />
                                            <span className="font-semibold text-gray-700">Tidak Ada Antrian</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Loket sedang tidak melayani antrian
                                        </p>
                                    </div>
                                )}

                                {statistics.next_waiting && (
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-5 w-5 text-orange-600" />
                                            <span className="font-semibold text-orange-700">Antrian Berikutnya</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-900">
                                            {statistics.next_waiting.queue_number}
                                        </p>
                                        <p className="text-sm text-orange-600">
                                            Terdaftar: {new Date(statistics.next_waiting.created_at).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Aksi Cepat</CardTitle>
                                <CardDescription>
                                    Tindakan yang dapat dilakukan untuk loket ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {hasPermission('operator.dashboard') && (
                                        <Link href={`/antrian/operator?counter=${counter.id}`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Activity className="mr-2 h-4 w-4" />
                                                Buka Operator Dashboard
                                            </Button>
                                        </Link>
                                    )}
                                    {hasPermission('display.counter') && (
                                        <Link href={`/antrian/display/counter/${counter.id}`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <MonitorSpeaker className="mr-2 h-4 w-4" />
                                                Buka Display Loket
                                            </Button>
                                        </Link>
                                    )}
                                    {hasPermission('queue.view') && (
                                        <Link href={`/antrian/queues?counter=${counter.id}`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Users className="mr-2 h-4 w-4" />
                                                Lihat Semua Antrian
                                            </Button>
                                        </Link>
                                    )}
                                    {hasPermission('counter.edit') && (
                                        <Link href={`/antrian/counters/${counter.id}/edit`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Edit3 className="mr-2 h-4 w-4" />
                                                Edit Loket
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <span className={`block text-sm font-medium ${className}`}>{children}</span>;
}
