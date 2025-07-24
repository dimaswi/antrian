import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Room } from "@/types/antrian";
import { Head, router, usePage } from "@inertiajs/react";
import { Edit3, PlusCircle, Search, Trash, X, Loader2, Building, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Props extends SharedData {
    rooms: Room[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Antrian',
        href: '/antrian',
    },
    {
        title: 'Ruangan',
        href: '/antrian/rooms',
    },
];

export default function RoomIndex() {
    const { rooms } = usePage<Props>().props;
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        room: Room | null;
        loading: boolean;
    }>({
        open: false,
        room: null,
        loading: false,
    });

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.code.toLowerCase().includes(search.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleClearSearch = () => {
        setSearch('');
    };

    const handleDeleteClick = (room: Room) => {
        setDeleteDialog({
            open: true,
            room: room,
            loading: false,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.room) return;
        
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await router.delete(route('antrian.rooms.destroy', deleteDialog.room.id), {
                onSuccess: () => {
                    toast.success(`Ruangan ${deleteDialog.room?.name} berhasil dihapus`);
                    setDeleteDialog({ open: false, room: null, loading: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus ruangan');
                    setDeleteDialog(prev => ({ ...prev, loading: false }));
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus ruangan');
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, room: null, loading: false });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Ruangan" />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Data Ruangan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola data ruangan untuk sistem antrian
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit('/antrian/rooms/create')}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Tambah Ruangan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Ruangan</CardTitle>
                        <CardDescription>
                            Total {rooms.length} ruangan terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="mb-4">
                            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari ruangan..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 pr-10"
                                    />
                                    {search && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearSearch}
                                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Ruangan</TableHead>
                                        <TableHead>Prefix</TableHead>
                                        <TableHead>Jumlah Loket</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRooms.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                {search ? 'Tidak ada ruangan yang sesuai dengan pencarian.' : 'Belum ada data ruangan.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRooms.map((room) => (
                                            <TableRow key={room.id}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="outline">{room.code}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        {room.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{room.prefix}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        {room.active_counters?.length || 0} Loket
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={room.is_active ? "default" : "secondary"}
                                                    >
                                                        {room.is_active ? "Aktif" : "Tidak Aktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {room.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/antrian/rooms/${room.id}`)}
                                                        >
                                                            Detail
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/antrian/rooms/${room.id}/edit`)}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(room)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus ruangan <strong>{deleteDialog.room?.name}</strong>?
                                <br />
                                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data loket yang terkait.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleDeleteCancel}
                                disabled={deleteDialog.loading}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={deleteDialog.loading}
                            >
                                {deleteDialog.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
