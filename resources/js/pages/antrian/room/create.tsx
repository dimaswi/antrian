import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Building, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function CreateRoom() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true as boolean,
        prefix: 'R',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('antrian.rooms.store'), {
            onSuccess: () => {
                reset();
                toast.success('Ruangan berhasil dibuat!');
                router.visit('/antrian/rooms');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                
                if (Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Gagal membuat ruangan. Periksa kembali data yang dimasukkan.');
                } else {
                    toast.error('Terjadi kesalahan saat membuat ruangan.');
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
            title: <Building />,
            href: '/antrian/rooms',
        },
        {
            title: 'Tambah Ruangan',
            href: '/antrian/rooms/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Ruangan" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Tambah Ruangan Baru
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Buat ruangan baru untuk sistem antrian
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/antrian/rooms')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Form Tambah Ruangan</CardTitle>
                        <CardDescription>
                            Isi data ruangan baru dengan lengkap dan benar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Ruangan <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Ruang Pendaftaran"
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
                                <Label htmlFor="code">Kode Ruangan <span className="text-destructive">*</span></Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: PENDFT"
                                    className={errors.code ? 'border-destructive' : ''}
                                />
                                {errors.code && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.code}</AlertDescription>
                                    </Alert>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Kode unik untuk mengidentifikasi ruangan
                                </p>
                            </div>

                            {/* Prefix Field */}
                            <div className="space-y-2">
                                <Label htmlFor="prefix">Prefix Antrian <span className="text-destructive">*</span></Label>
                                <Input
                                    id="prefix"
                                    type="text"
                                    value={data.prefix}
                                    onChange={(e) => setData('prefix', e.target.value.toUpperCase())}
                                    placeholder="Contoh: R, A, B"
                                    maxLength={10}
                                    className={errors.prefix ? 'border-destructive' : ''}
                                />
                                {errors.prefix && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.prefix}</AlertDescription>
                                    </Alert>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Awalan untuk nomor antrian (contoh: R001, A001)
                                </p>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Deskripsi ruangan (opsional)"
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
                                    Ruangan yang tidak aktif tidak akan muncul di sistem antrian
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/antrian/rooms')}
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
