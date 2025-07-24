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
import { Counter } from "@/types/antrian";
import { Head, router, usePage } from "@inertiajs/react";
import { Edit3, PlusCircle, Search, Trash, X, Loader2, Monitor, Building, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Props extends SharedData {
    counters: Counter[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Antrian',
        href: '/antrian',
    },
    {
        title: 'Loket',
        href: '/antrian/counters',
    },
];

export default function CounterIndex() {
    const { counters } = usePage<Props>().props;
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        counter: Counter | null;
        loading: boolean;
    }>({
        open: false,
        counter: null,
        loading: false,
    });

    const filteredCounters = counters.filter(counter =>
        counter.name.toLowerCase().includes(search.toLowerCase()) ||
        counter.code.toLowerCase().includes(search.toLowerCase()) ||
        counter.type.toLowerCase().includes(search.toLowerCase()) ||
        (counter.description && counter.description.toLowerCase().includes(search.toLowerCase())) ||
        (counter.room && counter.room.name.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleClearSearch = () => {
        setSearch('');
    };

    const handleDeleteClick = (counter: Counter) => {
        setDeleteDialog({
            open: true,
            counter: counter,
            loading: false,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.counter) return;
        
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await router.delete(route('antrian.counters.destroy', deleteDialog.counter.id), {
                onSuccess: () => {
                    toast.success(`Loket ${deleteDialog.counter?.name} berhasil dihapus`);
                    setDeleteDialog({ open: false, counter: null, loading: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus loket');
                    setDeleteDialog(prev => ({ ...prev, loading: false }));
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus loket');
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, counter: null, loading: false });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Loket" />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Monitor className="h-6 w-6" />
                            Data Loket
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola data loket pelayanan untuk sistem antrian
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit('/antrian/counters/create')}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Tambah Loket
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Loket</CardTitle>
                        <CardDescription>
                            Total {counters.length} loket terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="mb-4">
                            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari loket..."
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
                                        <TableHead>Nama Loket</TableHead>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Antrian Menunggu</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCounters.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                {search ? 'Tidak ada loket yang sesuai dengan pencarian.' : 'Belum ada data loket.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCounters.map((counter) => (
                                            <TableRow key={counter.id}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="outline">{counter.code}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Monitor className="h-4 w-4 text-muted-foreground" />
                                                        {counter.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        {counter.room?.name || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{counter.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={counter.is_active ? "default" : "secondary"}
                                                    >
                                                        {counter.is_active ? "Aktif" : "Tidak Aktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        {counter.waiting_count || 0} antrian
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {counter.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/antrian/counters/${counter.id}`)}
                                                        >
                                                            Detail
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/antrian/counters/${counter.id}/edit`)}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(counter)}
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
                                Apakah Anda yakin ingin menghapus loket <strong>{deleteDialog.counter?.name}</strong>?
                                <br />
                                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data antrian yang terkait.
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
