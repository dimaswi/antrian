import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
    queue_number: string;
}

export default function QueueNotFound({ queue_number }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
            <Head title={`Antrian Tidak Ditemukan - ${queue_number}`} />
            
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Antrian Tidak Ditemukan
                    </h1>
                    <p className="text-lg text-gray-600">
                        Maaf, kami tidak dapat menemukan antrian yang Anda cari
                    </p>
                </div>

                <Card className="border-2 border-red-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">
                            Nomor Antrian: {queue_number}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium mb-2">
                                Kemungkinan penyebab:
                            </p>
                            <ul className="text-red-700 text-sm space-y-1 text-left max-w-md mx-auto">
                                <li>• Nomor antrian salah atau tidak valid</li>
                                <li>• Antrian bukan untuk hari ini</li>
                                <li>• Antrian sudah expired atau dihapus</li>
                                <li>• Link mungkin rusak atau tidak lengkap</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                onClick={() => window.location.reload()}
                                className="w-full"
                                variant="outline"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Coba Lagi
                            </Button>
                            
                            <Button 
                                onClick={() => window.location.href = '/'}
                                className="w-full"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Kembali ke Beranda
                            </Button>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">
                                Jika Anda yakin nomor antrian benar, silakan hubungi petugas untuk bantuan.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
