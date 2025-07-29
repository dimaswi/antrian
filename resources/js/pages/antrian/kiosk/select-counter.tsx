import { Head, router } from "@inertiajs/react";
import { MonitorSpeaker, ArrowLeft, Printer, Users, Clock, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Room {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface Counter {
    id: number;
    name: string;
    code: string;
    type: string;
    is_active: boolean;
    waiting_queues_count: number;
    estimated_waiting_time: number;
    current_serving?: {
        queue_number: string;
    };
}

interface Props {
    room: Room;
    counters: Counter[];
}

export default function KioskSelectCounter({ room, counters }: Props) {
    const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCounterSelect = (counter: Counter) => {
        // Prevent double submission
        if (isProcessing) {
            return;
        }

        // Additional protection using localStorage
        const lastRequestKey = `last_ticket_request_${counter.id}`;
        const lastRequest = localStorage.getItem(lastRequestKey);
        const now = Date.now();
        
        if (lastRequest && (now - parseInt(lastRequest)) < 3000) { // 3 seconds
            toast.error('Permintaan terlalu cepat. Silakan tunggu beberapa detik.');
            return;
        }

        localStorage.setItem(lastRequestKey, now.toString());

        setSelectedCounter(counter);
        setIsProcessing(true);

        // Use Inertia router for CSRF handling and proper redirects
        router.post('/antrian/kiosk/generate-ticket', {
            counter_id: counter.id,
        }, {
            onError: (errors) => {
                console.error('Error generating ticket:', errors);
                
                // Show specific error message if available
                const errorMessage = errors.error || Object.values(errors)[0] || 'Gagal membuat tiket antrian. Silakan coba lagi.';
                toast.error(errorMessage);
                
                setIsProcessing(false);
                setSelectedCounter(null);
            },
            onSuccess: () => {
                // Clear the localStorage key on success
                localStorage.removeItem(lastRequestKey);
            },
            onFinish: () => {
                // Reset processing state if still on this page
                setIsProcessing(false);
                setSelectedCounter(null);
            }
        });
    };

    const handleBack = () => {
        router.visit('/antrian/kiosk/select-room');
    };

    const getTypeLabel = (type: string) => {
        const types = {
            general: { label: 'Umum', variant: 'default' as const, description: 'Pelayanan umum' },
            bpjs: { label: 'BPJS', variant: 'secondary' as const, description: 'Khusus pasien BPJS' },
            vip: { label: 'VIP', variant: 'destructive' as const, description: 'Layanan premium' },
            emergency: { label: 'Darurat', variant: 'destructive' as const, description: 'Layanan darurat' },
        };
        return types[type as keyof typeof types] || { label: type, variant: 'outline' as const, description: 'Layanan khusus' };
    };

    const getWaitingTimeColor = (minutes: number) => {
        if (minutes <= 10) return 'text-green-600 bg-green-50 border-green-200';
        if (minutes <= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Head title={`Kiosk - Pilih Loket - ${room.name}`} />
            
            {/* Header */}
            <div className="bg-white shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="p-2 border border-black"
                                disabled={isProcessing}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="p-3 bg-blue-600 rounded-lg text-white">
                                <Printer className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    KIOSK ANTRIAN
                                </h1>
                                <p className="text-lg text-gray-600">
                                    {room.name} ({room.code})
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
                                Langkah 2: Pilih Loket Pelayanan
                            </h2>
                            <p className="text-lg text-blue-600">
                                Silakan pilih loket sesuai dengan jenis pelayanan yang Anda butuhkan
                            </p>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Room Info */}
                <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Building className="h-6 w-6" />
                            <div>
                                <h3 className="text-xl font-bold">{room.name}</h3>
                                <p className="text-blue-100">{room.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Counter Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {counters.map((counter) => {
                        const typeInfo = getTypeLabel(counter.type);
                        const isSelected = selectedCounter?.id === counter.id;
                        const isDisabled = !counter.is_active || isProcessing;
                        
                        return (
                            <Card 
                                key={counter.id}
                                className={`cursor-pointer transition-all duration-300 border-2 ${
                                    isDisabled 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                        : isSelected
                                            ? 'border-blue-500 shadow-xl scale-105 bg-blue-50'
                                            : 'hover:shadow-xl hover:scale-105 hover:border-blue-300'
                                }`}
                                onClick={() => !isDisabled && handleCounterSelect(counter)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex gap-3">
                                        <MonitorSpeaker className="h-6 w-6" />
                                        <div>
                                            <div className="text-xl font-bold">{counter.name}</div>
                                            <div className="text-green-100 font-mono text-sm">{counter.code}</div>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Type Badge */}
                                    <div className="mb-4">
                                        <Badge variant={typeInfo.variant} className="text-sm">
                                            {typeInfo.label}
                                        </Badge>
                                        <p className="text-xs text-gray-600 mt-1">{typeInfo.description}</p>
                                    </div>

                                    {counter.is_active ? (
                                        <div className="space-y-3">
                                            {/* Current Serving */}
                                            {counter.current_serving ? (
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-sm font-medium text-green-700">Sedang Melayani</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-green-800 font-mono">
                                                        {counter.current_serving.queue_number}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-blue-700">Siap Melayani</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Waiting Queue */}
                                            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm font-medium text-orange-700">Menunggu</span>
                                                </div>
                                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                                    {counter.waiting_queues_count} orang
                                                </Badge>
                                            </div>

                                            {/* Estimated Waiting Time */}
                                            <div className={`flex items-center justify-between p-3 border rounded-lg ${getWaitingTimeColor(counter.estimated_waiting_time)}`}>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Est. Tunggu</span>
                                                </div>
                                                <Badge variant="outline" className="border-current">
                                                    {counter.estimated_waiting_time} menit
                                                </Badge>
                                            </div>

                                            {/* Action Button */}
                                            <Button 
                                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                                                onClick={() => handleCounterSelect(counter)}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing && isSelected ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Memproses...
                                                    </div>
                                                ) : (
                                                    'Ambil Nomor Antrian'
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 font-medium">Loket Tidak Aktif</p>
                                            <p className="text-xs text-gray-400 mt-1">Silakan pilih loket lain</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {counters.length === 0 && (
                    <Card className="text-center py-16">
                        <CardContent>
                            <MonitorSpeaker className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Tidak Ada Loket Tersedia
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Saat ini tidak ada loket yang aktif di ruangan {room.name}.
                            </p>
                            <Button onClick={handleBack} variant="outline">
                                Pilih Ruangan Lain
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                            <p className="text-gray-600">
                                <strong>Informasi:</strong> Estimasi waktu tunggu dapat berubah tergantung kondisi antrian. 
                                Pastikan Anda memilih loket yang sesuai dengan jenis pelayanan yang dibutuhkan.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="max-w-md mx-4">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-xl font-semibold mb-2">Memproses Permintaan</h3>
                            <p className="text-gray-600">Sedang membuat nomor antrian Anda...</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
