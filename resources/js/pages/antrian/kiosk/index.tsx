import { Head, Link } from "@inertiajs/react";
import { Building, Users, Clock, ArrowRight, Ticket, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Room {
    id: number;
    name: string;
    code: string;
    description?: string;
    counters_count: number;
    waiting_queues_count: number;
    estimated_wait_time: number;
}

interface Props {
    rooms: Room[];
}

export default function KioskIndex({ rooms }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Head title="Kiosk Antrian - Pilih Layanan" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Sistem Antrian Digital
                        </h1>
                        <p className="text-xl text-gray-600">
                            Pilih layanan yang ingin Anda gunakan
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Instructions */}
                <Card className="mb-8 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <QrCode className="h-6 w-6" />
                            Cara Menggunakan Kiosk
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-700">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Pilih ruangan layanan yang ingin Anda kunjungi</li>
                            <li>Pilih loket yang tersedia</li>
                            <li>Ambil nomor antrian Anda</li>
                            <li>Tunggu hingga nomor Anda dipanggil</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Room Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        Pilih Ruangan Layanan
                    </h2>
                    
                    {rooms && rooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map((room) => (
                                <Link key={room.id} href={`/antrian/kiosk/room/${room.id}/select-counter`}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
                                        <CardHeader className="text-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Building className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-900">
                                                {room.name}
                                            </CardTitle>
                                            <CardDescription className="text-lg font-mono font-semibold text-blue-600">
                                                {room.code}
                                            </CardDescription>
                                            {room.description && (
                                                <CardDescription className="text-sm text-gray-600 mt-2">
                                                    {room.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Statistics */}
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                        <Users className="h-4 w-4" />
                                                        <span className="text-xs">Loket</span>
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {room.counters_count || 0}
                                                    </div>
                                                </div>
                                                <div className="bg-orange-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                                                        <Ticket className="h-4 w-4" />
                                                        <span className="text-xs">Antrian</span>
                                                    </div>
                                                    <div className="text-xl font-bold text-orange-700">
                                                        {room.waiting_queues_count || 0}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Wait Time */}
                                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-xs">Estimasi Tunggu</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-700">
                                                    {room.estimated_wait_time || 0} menit
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="text-center">
                                                {room.counters_count > 0 ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                                        Tersedia
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        Tidak Tersedia
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Button 
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                disabled={room.counters_count === 0}
                                            >
                                                Pilih Ruangan
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Tidak Ada Layanan Tersedia
                                </h3>
                                <p className="text-gray-600">
                                    Saat ini tidak ada ruangan layanan yang tersedia.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <Ticket className="h-6 w-6" />
                                Ambil Nomor Antrian
                            </CardTitle>
                            <CardDescription className="text-green-700">
                                Pilih ruangan dan loket untuk mengambil nomor antrian baru
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/antrian/kiosk/select-room">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    Mulai Ambil Antrian
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <QrCode className="h-6 w-6" />
                                Cek Status Antrian
                            </CardTitle>
                            <CardDescription className="text-blue-700">
                                Masukkan nomor antrian untuk melihat status terkini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                                Cek Status
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
                    <p>&copy; 2025 Sistem Antrian Digital. Semua hak dilindungi.</p>
                </div>
            </div>
        </div>
    );
}
