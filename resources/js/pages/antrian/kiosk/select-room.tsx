import { Head, router } from "@inertiajs/react";
import { Building, ArrowLeft, Printer, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Room {
    id: number;
    name: string;
    code: string;
    description: string;
    active_counters_count: number;
    waiting_queues_count: number;
    estimated_waiting_time: number;
}

interface Props {
    rooms: Room[];
}

export default function KioskSelectRoom({ rooms }: Props) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRoomSelect = (room: Room) => {
        router.visit(`/antrian/kiosk/room/${room.id}/select-counter`);
    };

    const getWaitingTimeColor = (minutes: number) => {
        if (minutes <= 15) return 'text-green-600 bg-green-50';
        if (minutes <= 30) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Head title="Kiosk - Pilih Ruangan" />
            
            {/* Header */}
            <div className="bg-white shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-lg text-white">
                                <Printer className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    KIOSK ANTRIAN
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Ambil Nomor Antrian Anda
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {currentTime.toLocaleTimeString('id-ID')}
                            </div>
                            <div className="text-gray-600">
                                {currentTime.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Instructions */}
                {/* <Card className="mb-8 bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-blue-700 mb-2">
                                Langkah 1: Pilih Ruangan Tujuan
                            </h2>
                            <p className="text-lg text-blue-600">
                                Silakan pilih ruangan sesuai dengan keperluan Anda
                            </p>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Room Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <Card 
                            key={room.id}
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-300"
                            onClick={() => handleRoomSelect(room)}
                        >
                            <CardHeader>
                                <CardTitle className="flex gap-3">
                                    <Building className="h-6 w-6" />
                                    <div>
                                        <div className="text-xl font-bold">{room.name}</div>
                                        <div className="text-blue-100 font-mono text-sm">{room.code}</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {room.description && (
                                    <p className="text-gray-600 mb-4 text-sm">
                                        {room.description}
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {/* Loket Aktif */}
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-green-700">Loket Aktif</span>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                            {room.active_counters_count} loket
                                        </Badge>
                                    </div>

                                    {/* Antrian Menunggu */}
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm font-medium text-orange-700">Antrian Menunggu</span>
                                        </div>
                                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                            {room.waiting_queues_count} orang
                                        </Badge>
                                    </div>

                                    {/* Estimasi Waktu Tunggu */}
                                    <div className={`flex items-center justify-between p-3 rounded-lg ${getWaitingTimeColor(room.estimated_waiting_time)}`}>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm font-medium">Estimasi Tunggu</span>
                                        </div>
                                        <Badge variant="outline" className="border-current">
                                            {room.estimated_waiting_time} menit
                                        </Badge>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="mt-6">
                                    <Button 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                                        onClick={() => handleRoomSelect(room)}
                                    >
                                        Pilih Ruangan Ini
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {rooms.length === 0 && (
                    <Card className="text-center py-16">
                        <CardContent>
                            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Tidak Ada Ruangan Tersedia
                            </h3>
                            <p className="text-gray-500">
                                Saat ini tidak ada ruangan yang aktif untuk sistem antrian.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                            <p className="text-gray-600">
                                <strong>Bantuan:</strong> Jika Anda kesulitan memilih ruangan yang tepat, 
                                silakan tanyakan kepada petugas informasi atau gunakan peta rumah sakit.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            {/* <div className="bg-white border-t mt-16">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Sistem Antrian Rumah Sakit • Data diperbarui real-time
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Sistem Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
