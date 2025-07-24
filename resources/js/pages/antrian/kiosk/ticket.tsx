import { Head } from "@inertiajs/react";
import { Printer, CheckCircle, Building, MonitorSpeaker, Clock, Users, Home, RefreshCw, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import QRCodeComponent from "@/components/QRCode";

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
    room_id: number;
    counter_id: number;
    created_at: string;
    estimated_call_time: string;
    room: Room;
    counter: Counter;
}

interface Props {
    queue: Queue;
    position?: number;
    estimated_wait_time?: number;
}

export default function KioskTicket({ queue, position, estimated_wait_time }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [canPrint, setCanPrint] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Check if browser supports printing
        setCanPrint(typeof window !== 'undefined' && typeof window.print === 'function');
    }, []);

    const handlePrint = () => {
        if (canPrint) {
            window.print();
        }
    };

    const handleNewTicket = () => {
        window.location.href = '/antrian/kiosk/select-room';
    };

    const handleHome = () => {
        window.location.href = '/';
    };

    const getTypeLabel = (type: string) => {
        const types = {
            general: { label: 'Umum', variant: 'default' as const },
            bpjs: { label: 'BPJS', variant: 'secondary' as const },
            vip: { label: 'VIP', variant: 'destructive' as const },
            emergency: { label: 'Darurat', variant: 'destructive' as const },
        };
        return types[type as keyof typeof types] || { label: type, variant: 'outline' as const };
    };

    const typeInfo = getTypeLabel(queue.counter.type);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <Head title={`Tiket Antrian - ${queue.queue_number}`} />
            
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 80mm;
                        max-width: 300px;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            `}</style>

            {/* Header - No Print */}
            <div className="bg-white shadow-lg no-print">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-600 rounded-lg text-white">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    TIKET BERHASIL DIBUAT
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Simpan tiket ini dengan baik
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
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
                {/* Success Message - No Print */}
                <div className="text-center mb-8 no-print">
                    <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold text-lg">Nomor antrian berhasil dibuat!</span>
                    </div>
                </div>

                {/* Ticket - Print Area */}
                <div className="print-area max-w-md mx-auto">
                    <Card className="border-2 border-dashed border-gray-300 bg-white shadow-xl">
                        <CardContent className="p-8 text-center">
                            {/* Header */}
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    RUMAH SAKIT
                                </h2>
                                <p className="text-lg font-semibold text-blue-600">
                                    TIKET ANTRIAN
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(queue.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {/* Queue Number */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">NOMOR ANTRIAN ANDA</p>
                                <div className="text-6xl font-bold text-blue-600 font-mono bg-blue-50 py-4 rounded-lg border-2 border-blue-200">
                                    {queue.queue_number}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4 text-left mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Building className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ruangan</p>
                                        <p className="font-semibold">{queue.room.name}</p>
                                        <p className="text-xs text-gray-500">{queue.room.code}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MonitorSpeaker className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Loket</p>
                                        <p className="font-semibold">{queue.counter.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-gray-500">{queue.counter.code}</p>
                                            <Badge variant={typeInfo.variant} className="text-xs">
                                                {typeInfo.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Users className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm text-orange-700">Antrian Sebelum Anda</p>
                                        <p className="font-semibold text-orange-800">{position ? position - 1 : 0} orang</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-blue-700">Estimasi Waktu Tunggu</p>
                                        <p className="font-semibold text-blue-800">{estimated_wait_time || 0} menit</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs text-gray-600 mb-2 font-semibold">PETUNJUK:</p>
                                <ul className="text-xs text-gray-600 text-left space-y-1">
                                    <li>• Harap menunggu nomor Anda dipanggil</li>
                                    <li>• Pantau display antrian di ruangan tujuan</li>
                                    <li>• Jika melewati 3x panggilan, nomor akan dibatalkan</li>
                                    <li>• Tunjukkan tiket ini saat dipanggil</li>
                                </ul>
                            </div>

                            {/* QR Code for Status Tracking */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-600 mb-2 font-semibold flex items-center justify-center gap-1">
                                        <QrCode className="h-3 w-3" />
                                        PANTAU STATUS ANTRIAN
                                    </p>
                                    <div className="bg-white p-2 rounded border-2 border-dashed border-gray-300 inline-block">
                                        <QRCodeComponent 
                                            value={`${window.location.origin}/queue/status/${queue.queue_number}`}
                                            size={80}
                                            className="block mx-auto"
                                            options={{
                                                margin: 1,
                                                errorCorrectionLevel: 'M'
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Scan QR code untuk cek status real-time
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 break-all">
                                        {window.location.origin}/queue/status/{queue.queue_number}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <p className="text-xs text-gray-500">
                                    Waktu cetak: {new Date(queue.created_at).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ID: {queue.id}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
                    {canPrint && (
                        <Button 
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                        >
                            <Printer className="mr-2 h-5 w-5" />
                            Cetak Tiket
                        </Button>
                    )}
                    
                    <Button 
                        onClick={handleNewTicket}
                        variant="outline"
                        className="font-semibold px-8 py-3"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Ambil Nomor Lagi
                    </Button>
                    
                    <Button 
                        onClick={handleHome}
                        variant="outline"
                        className="font-semibold px-8 py-3"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Selesai
                    </Button>
                </div>

                {/* Important Notes - No Print */}
                <div className="mt-8 max-w-2xl mx-auto no-print">
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Informasi Penting
                            </h3>
                            <ul className="text-sm text-yellow-700 space-y-2">
                                <li>• <strong>Estimasi waktu</strong> dapat berubah tergantung kondisi pelayanan</li>
                                <li>• <strong>Datang 10-15 menit</strong> sebelum estimasi waktu panggilan</li>
                                <li>• <strong>Pantau display</strong> antrian di ruangan {queue.room.name}</li>
                                <li>• <strong>Hubungi petugas</strong> jika ada kendala atau pertanyaan</li>
                                <li>• <strong>Simpan tiket ini</strong> hingga selesai dilayani</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
