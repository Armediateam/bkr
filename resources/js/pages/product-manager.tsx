import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { dashboard } from '@/routes';

type ProductManagerRow = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
};

type PageProps = {
    users: ProductManagerRow[];
    flash: {
        success?: string | null;
    };
};

export default function ProductManager({ users }: { users: ProductManagerRow[] }) {
    const { flash } = usePage<PageProps>().props;
    const showSkeleton = usePageSkeleton();
    const [open, setOpen] = useState(false);
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    if (showSkeleton) {
        return (
            <>
                <Head title="Product Manager" />
                <ProductManagerPageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Product Manager" />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Product Manager</DialogTitle>
                        <DialogDescription>
                            Akun ini langsung dipakai untuk login dan akses form submit laporan.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="grid gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/dashboard/product-manager', {
                                onSuccess: () => {
                                    form.reset();
                                    setOpen(false);
                                },
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="Nama Product Manager"
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
                                placeholder="pm@perusahaan.com"
                            />
                            {form.errors.email ? <p className="text-sm text-destructive">{form.errors.email}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                placeholder="Minimal 8 karakter"
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
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={form.processing}>
                                <Plus className="size-4" />
                                Add Product Manager
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
                            <CardTitle>Product Manager</CardTitle>
                            <CardDescription>
                                Owner membuat akun Product Manager dari sini. Akun yang dibuat langsung dipakai untuk akses form submit laporan.
                            </CardDescription>
                            </div>

                            <Button
                                type="button"
                                className="w-full min-[900px]:w-auto"
                                onClick={() => setOpen(true)}
                            >
                                <Plus className="size-4" />
                                Add Product Manager
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {flash.success ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {flash.success}
                            </div>
                        ) : null}

                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status Verifikasi</TableHead>
                                        <TableHead>Dibuat Pada</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.email_verified_at ? 'Terverifikasi' : 'Belum verifikasi'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                                                Belum ada akun Product Manager.
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

function ProductManagerPageSkeleton() {
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

ProductManager.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Product Manager',
            href: '/dashboard/product-manager',
        },
    ],
};
