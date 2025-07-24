import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { MonitorSpeaker, ArrowLeft, Save, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
}

interface Props {
    counter: Counter;
    rooms: Room[];
}

export default function EditCounter({ counter, rooms }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: counter.name || '',
        code: counter.code || '',
        description: counter.description || '',
        room_id: counter.room_id || '',
        type: counter.type || 'general',
        is_active: counter.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('antrian.counters.update', counter.id), {
            onSuccess: () => {
                toast.success('Loket berhasil diperbarui!');
                router.visit('/antrian/counters');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                
                if (Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Gagal memperbarui loket. Periksa kembali data yang dimasukkan.');
                } else {
                    toast.error('Terjadi kesalahan saat memperbarui loket.');
                }
            },
        });
    };

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
        {
            title: 'Edit',
            href: `/antrian/counters/${counter.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Loket - ${counter.name}`} />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <MonitorSpeaker className="h-6 w-6" />
                            Edit Loket: {counter.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Perbarui informasi loket {counter.code}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(`/antrian/counters/${counter.id}`)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Form Edit Loket</CardTitle>
                        <CardDescription>
                            Perbarui data loket dengan informasi yang benar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Room Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="room_id">Ruangan <span className="text-destructive">*</span></Label>
                                <Select value={data.room_id.toString()} onValueChange={(value) => setData('room_id', parseInt(value))}>
                                    <SelectTrigger className={errors.room_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih ruangan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    <span>{room.name} ({room.code})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.room_id && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.room_id}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Loket <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Loket 1"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.name}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Code Field */}
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Loket <span className="text-destructive">*</span></Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: L001"
                                    className={errors.code ? 'border-destructive' : ''}
                                />
                                {errors.code && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.code}</AlertDescription>
                                    </Alert>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Kode unik untuk mengidentifikasi loket
                                </p>
                            </div>

                            {/* Type Field */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Loket <span className="text-destructive">*</span></Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih tipe loket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">
                                            <div className="flex flex-col">
                                                <span>General</span>
                                                <span className="text-xs text-muted-foreground">Loket umum</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="bpjs">
                                            <div className="flex flex-col">
                                                <span>BPJS</span>
                                                <span className="text-xs text-muted-foreground">Khusus pasien BPJS</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="vip">
                                            <div className="flex flex-col">
                                                <span>VIP</span>
                                                <span className="text-xs text-muted-foreground">Layanan premium</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="emergency">
                                            <div className="flex flex-col">
                                                <span>Emergency</span>
                                                <span className="text-xs text-muted-foreground">Layanan darurat</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.type}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Deskripsi loket (opsional)"
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.description}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Status Field */}
                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status Aktif</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-normal">
                                        {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Loket yang tidak aktif tidak akan menerima antrian baru
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(`/antrian/counters/${counter.id}`)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
