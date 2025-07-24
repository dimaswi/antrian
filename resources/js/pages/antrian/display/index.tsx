import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Tv, Building, MonitorSpeaker, Eye, Activity, Users, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Room {
    id: number;
    name: string;
    code: string;
    description?: string;
    counters_count: number;
    active_counters_count: number;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    room: Room;
    is_active: boolean;
}

interface Props extends SharedData {
    rooms: Room[];
    counters: Counter[];
}

export default function DisplayIndex({ rooms, counters }: Props) {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/" },
        { title: "Antrian", href: "/antrian" },
        { title: "Display Monitor", href: "#" },
    ];

    const activeRooms = rooms.filter(room => room.active_counters_count > 0);
    const activeCounters = counters.filter(counter => counter.is_active);

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Display Monitor - Sistem Antrian" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Display Monitor</h1>
                        <p className="text-muted-foreground">Pilih tampilan display untuk monitor antrian</p>
                    </div>
                </div>

                {/* Universal Display */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <Tv className="h-6 w-6" />
                            </div>
                            Display Universal
                        </CardTitle>
                        <CardDescription>
                            Tampilan gabungan semua ruangan dan counter untuk monitor utama
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Building className="h-3 w-3" />
                                        {activeRooms.length} Ruangan Aktif
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <MonitorSpeaker className="h-3 w-3" />
                                        {activeCounters.length} Counter Aktif
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Cocok untuk lobby utama atau monitor informasi umum
                                </p>
                            </div>
                        </div>
                        
                        {/* Display Style Options */}
                        <div className="flex gap-3">
                            <Button asChild variant="default" size="sm" className="flex-1">
                                <Link href="/antrian/display/universal" target="_blank">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Classic View
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50">
                                <Link href="/antrian/display/universal-glass" target="_blank">
                                    <Tv className="h-4 w-4 mr-2" />
                                    Glass UI ✨
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Room Displays */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Display Per Ruangan
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeRooms.map((room) => (
                            <Card key={room.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-5 w-5 text-indigo-600" />
                                            {room.name}
                                        </div>
                                        <Badge variant="secondary">{room.code}</Badge>
                                    </CardTitle>
                                    {room.description && (
                                        <CardDescription>{room.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Counter Aktif:</span>
                                            <Badge variant="outline">
                                                {room.active_counters_count} dari {room.counters_count}
                                            </Badge>
                                        </div>
                                        
                                        {/* Display Style Options */}
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" className="flex-1">
                                                <Link href={`/antrian/display/room/${room.id}`} target="_blank">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Classic
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50">
                                                <Link href={`/antrian/display/room-glass/${room.id}`} target="_blank">
                                                    <Tv className="h-3 w-3 mr-1" />
                                                    Glass ✨
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Counter Displays */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MonitorSpeaker className="h-5 w-5" />
                        Display Per Counter
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeCounters.map((counter) => (
                            <Card key={counter.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MonitorSpeaker className="h-5 w-5 text-blue-600" />
                                            {counter.name}
                                        </div>
                                        <Badge variant="secondary">{counter.code}</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {counter.room.name} - {counter.room.code}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant="default" className="bg-green-600">
                                                <Activity className="h-3 w-3 mr-1" />
                                                Aktif
                                            </Badge>
                                        </div>
                                        
                                        {/* Display Style Options */}
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" className="flex-1">
                                                <Link href={`/antrian/display/counter/${counter.id}`} target="_blank">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Classic
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50">
                                                <Link href={`/antrian/display/counter-glass/${counter.id}`} target="_blank">
                                                    <Tv className="h-3 w-3 mr-1" />
                                                    Glass ✨
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <Card className="bg-gray-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Petunjuk Penggunaan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                            <Tv className="h-4 w-4 mt-1 text-blue-600" />
                            <div>
                                <p className="font-medium">Display Universal</p>
                                <p className="text-sm text-muted-foreground">
                                    Untuk monitor di lobby utama, menampilkan semua antrian dalam satu layar
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Building className="h-4 w-4 mt-1 text-indigo-600" />
                            <div>
                                <p className="font-medium">Display Per Ruangan</p>
                                <p className="text-sm text-muted-foreground">
                                    Untuk monitor di setiap ruangan, menampilkan semua counter dalam ruangan tersebut
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <MonitorSpeaker className="h-4 w-4 mt-1 text-blue-600" />
                            <div>
                                <p className="font-medium">Display Per Counter</p>
                                <p className="text-sm text-muted-foreground">
                                    Untuk monitor di setiap counter, menampilkan detail antrian counter tersebut
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 border-t pt-3 mt-3">
                            <div className="h-4 w-4 mt-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                            <div>
                                <p className="font-medium text-purple-700">Glass UI ✨</p>
                                <p className="text-sm text-muted-foreground">
                                    Tampilan modern dengan efek glass morphism, gradient backgrounds, dan animasi yang elegan - cocok untuk fasilitas premium
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
