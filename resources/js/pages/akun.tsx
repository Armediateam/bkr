import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'product_manager';
    email_verified_at: string | null;
    created_at: string;
};

type PageProps = {
    users: UserRow[];
    flash: {
        success?: string | null;
        error?: string | null;
    };
};

export default function Akun({ users }: { users: UserRow[] }) {
    const { auth, flash } = usePage<PageProps>().props;
    const showSkeleton = usePageSkeleton();
    const [open, setOpen] = useState(false);
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'product_manager',
    });

    if (showSkeleton) {
        return (
            <>
                <Head title="Manajemen Akun" />
                <AkunPageSkeleton />
            </>
        );
    }

    const handleDelete = (id: number, name: string) => {
        if (id === auth.user.id) {
            alert('Anda tidak bisa menghapus akun Anda sendiri.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus akun "${name}"?`)) {
            router.delete(`/dashboard/akun/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Manajemen Akun" />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Akun Baru</DialogTitle>
                        <DialogDescription>
                            Buat akun baru untuk login ke dashboard dengan role yang ditentukan.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="grid gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/dashboard/akun', {
                                onSuccess: () => {
                                    form.reset();
                                    setOpen(false);
                                },
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="Nama Pengguna"
                                required
                            />
                            {form.errors.name ? <p className="text-sm text-destructive">{form.errors.name}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                placeholder="user@perusahaan.com"
                                required
                            />
                            {form.errors.email ? <p className="text-sm text-destructive">{form.errors.email}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role / Akses</Label>
                            <Select
                                value={form.data.role}
                                onValueChange={(value) => form.setData('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner (Akses Penuh)</SelectItem>
                                    <SelectItem value="product_manager">Product Manager</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.role ? <p className="text-sm text-destructive">{form.errors.role}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {form.errors.password ? <p className="text-sm text-destructive">{form.errors.password}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                placeholder="Ulangi password"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={form.processing}>
                                <Plus className="mr-2 size-4" />
                                Tambah Akun
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Card className="border-0 py-6 shadow-none">
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
                            <div className="space-y-1">
                                <CardTitle>Daftar Akun Pengguna</CardTitle>
                                <CardDescription>
                                    Kelola semua akun pengguna yang terdaftar untuk masuk ke aplikasi.
                                </CardDescription>
                            </div>

                            <Button
                                type="button"
                                className="w-full min-[900px]:w-auto"
                                onClick={() => setOpen(true)}
                            >
                                <Plus className="mr-2 size-4" />
                                Tambah Akun Baru
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {flash.success ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {flash.success}
                            </div>
                        ) : null}

                        {flash.error ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {flash.error}
                            </div>
                        ) : null}

                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Dibuat Pada</TableHead>
                                        <TableHead className="w-[100px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.role === 'owner' ? (
                                                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-700/10 ring-inset dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                                                            Owner
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10 ring-inset dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                                            Product Manager
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {user.id === auth.user.id ? (
                                                        <span className="text-xs text-muted-foreground italic mr-2">Anda</span>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">Hapus</span>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                                Belum ada akun pengguna.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function AkunPageSkeleton() {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
            <Card className="border-0 py-6 shadow-none">
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-44" />
                            <Skeleton className="h-4 w-full max-w-2xl" />
                        </div>
                        <Skeleton className="h-10 w-full min-[900px]:w-44" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                        <Skeleton className="h-12 w-full rounded-none" />
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-14 w-full rounded-none border-t" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

Akun.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Manajemen Akun',
            href: '/dashboard/akun',
        },
    ],
};
