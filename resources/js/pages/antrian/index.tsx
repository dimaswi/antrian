import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Building, MonitorSpeaker, LayoutGrid, Tv, UserCheck, Timer, Users, Activity, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermission } from "@/hooks/use-permission";

interface Stats {
    total_rooms: number;
    total_counters: number;
    total_queues_today: number;
    active_queues: number;
    completed_queues_today: number;
    average_waiting_time: number;
}

interface Props {
    stats: Stats;
}

export default function AntrianDashboard({ stats }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Antrian',
            href: '/antrian',
        },
        {
            title: 'Dashboard',
            href: '/antrian',
        },
    ];

    const menuItems = [
        {
            title: 'Ruangan',
            description: 'Kelola ruangan untuk sistem antrian',
            href: '/antrian/rooms',
            icon: Building,
            permission: 'room.view',
            color: 'bg-blue-500 hover:bg-blue-600',
        },
        {
            title: 'Loket',
            description: 'Kelola loket dan counter layanan',
            href: '/antrian/counters',
            icon: MonitorSpeaker,
            permission: 'counter.view',
            color: 'bg-green-500 hover:bg-green-600',
        },
        {
            title: 'Queue Management',
            description: 'Kelola antrian dan statistik',
            href: '/antrian/queues',
            icon: LayoutGrid,
            permission: 'queue.view',
            color: 'bg-purple-500 hover:bg-purple-600',
        },
        {
            title: 'Display Universal',
            description: 'Display antrian untuk semua ruangan',
            href: '/antrian/display/universal',
            icon: Tv,
            permission: 'display.universal',
            color: 'bg-orange-500 hover:bg-orange-600',
        },
        {
            title: 'Dashboard Operator',
            description: 'Interface untuk operator loket',
            href: '/antrian/operator',
            icon: UserCheck,
            permission: 'operator.dashboard',
            color: 'bg-red-500 hover:bg-red-600',
        },
    ];

    const statCards = [
        {
            title: 'Total Ruangan',
            value: stats.total_rooms,
            icon: Building,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Loket',
            value: stats.total_counters,
            icon: MonitorSpeaker,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Antrian Hari Ini',
            value: stats.total_queues_today,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Antrian Aktif',
            value: stats.active_queues,
            icon: Activity,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Selesai Hari Ini',
            value: stats.completed_queues_today,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: 'Rata-rata Tunggu',
            value: `${Math.round(stats.average_waiting_time)} menit`,
            icon: Clock,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Antrian" />
            <div className="p-4">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Dashboard Antrian</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Sistem manajemen antrian rumah sakit - Monitor dan kelola antrian dengan efisien
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
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

                {/* Quick Access Menu */}
                <Card>
                    <CardHeader>
                        <CardTitle>Menu Utama</CardTitle>
                        <CardDescription>
                            Akses cepat ke fitur-fitur sistem antrian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuItems.map((item, index) => {
                                // Check permission if required
                                if (item.permission && !hasPermission(item.permission)) {
                                    return null;
                                }

                                return (
                                    <Link key={index} href={item.href}>
                                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-lg text-white ${item.color} group-hover:scale-110 transition-transform`}>
                                                        <item.icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                            <CardDescription>
                                Tindakan yang sering dilakukan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {hasPermission('room.create') && (
                                <Link href="/antrian/rooms/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Building className="mr-2 h-4 w-4" />
                                        Tambah Ruangan Baru
                                    </Button>
                                </Link>
                            )}
                            {hasPermission('counter.create') && (
                                <Link href="/antrian/counters/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <MonitorSpeaker className="mr-2 h-4 w-4" />
                                        Tambah Loket Baru
                                    </Button>
                                </Link>
                            )}
                            {hasPermission('display.universal') && (
                                <Link href="/antrian/display/universal">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Tv className="mr-2 h-4 w-4" />
                                        Buka Display Universal
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Sistem</CardTitle>
                            <CardDescription>
                                Informasi status sistem antrian
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status Sistem</span>
                                    <span className="inline-flex items-center gap-1 text-green-600">
                                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Ruangan Aktif</span>
                                    <span className="text-sm text-muted-foreground">
                                        {stats.total_rooms} ruangan
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Loket Aktif</span>
                                    <span className="text-sm text-muted-foreground">
                                        {stats.total_counters} loket
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Antrian Berlangsung</span>
                                    <span className="text-sm text-muted-foreground">
                                        {stats.active_queues} antrian
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
