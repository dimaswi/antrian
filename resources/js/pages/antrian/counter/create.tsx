import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Room } from "@/types/antrian";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Monitor, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Props extends SharedData {
    rooms: Room[];
}

export default function CreateCounter() {
    const { rooms } = usePage<Props>().props;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        room_id: '',
        name: '',
        code: '',
        description: '',
        is_active: true as boolean,
        type: 'general',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('antrian.counters.store'), {
            onSuccess: () => {
                reset();
                toast.success('Loket berhasil dibuat!');
                router.visit('/antrian/counters');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                
                if (Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Gagal membuat loket. Periksa kembali data yang dimasukkan.');
                } else {
                    toast.error('Terjadi kesalahan saat membuat loket.');
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
            title: <Monitor />,
            href: '/antrian/counters',
        },
        {
            title: 'Tambah Loket',
            href: '/antrian/counters/create',
        },
    ];

    const counterTypes = [
        { value: 'general', label: 'Umum' },
        { value: 'bpjs', label: 'BPJS' },
        { value: 'vip', label: 'VIP' },
        { value: 'emergency', label: 'Darurat' },
        { value: 'specialist', label: 'Spesialis' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Loket" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Monitor className="h-6 w-6" />
                            Tambah Loket Baru
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Buat loket pelayanan baru untuk sistem antrian
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/antrian/counters')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Form Tambah Loket</CardTitle>
                        <CardDescription>
                            Isi data loket baru dengan lengkap dan benar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Room Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="room_id">Ruangan <span className="text-destructive">*</span></Label>
                                <Select value={data.room_id} onValueChange={(value) => setData('room_id', value)}>
                                    <SelectTrigger className={errors.room_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih ruangan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.name} ({room.code})
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
                                    placeholder="Contoh: Loket Umum 1"
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
                                    placeholder="Contoh: LKT01"
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
                                <Label htmlFor="type">Jenis Loket <span className="text-destructive">*</span></Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih jenis loket..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {counterTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
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
                                    Loket yang tidak aktif tidak akan muncul di sistem antrian
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/antrian/counters')}
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
                                            Simpan
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
