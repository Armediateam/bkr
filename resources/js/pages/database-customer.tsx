import { Head, useForm } from '@inertiajs/react';
import {
    BadgeDollarSign,
    CalendarClock,
    Eye,
    Plus,
    Save,
    Search,
    Star,
    Users,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Customer = {
    id: number;
    nama: string;
    kontak: string;
    alamat: string;
    catatan: string;
    totalOmzet: number;
    keuntungan: number;
    piutang: number;
    jatuhTempo: number;
    status: string;
    terakhirBeli: string;
    transaksi: number;
};

type Activity = {
    tanggal: string;
    customer: string;
    keterangan: string;
    nilai: number;
    status: string;
};

type Props = {
    customers: Customer[];
    activities: Activity[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function compactRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(value);
}

function Field({
    label,
    children,
    required = false,
}: {
    label: string;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label>
                {label} {required && <span className="text-red-600">*</span>}
            </Label>
            {children}
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="flex min-h-28 items-start justify-between gap-4 p-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="rounded-md border bg-muted/40 p-2 text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

export default function DatabaseCustomer({ customers, activities }: Props) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'omzet' | 'piutang' | 'jatuhTempo'>(
        'omzet',
    );
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return customers
            .filter((customer) =>
                [customer.nama, customer.kontak, customer.alamat]
                    .join(' ')
                    .toLowerCase()
                    .includes(term),
            )
            .sort((a, b) => {
                if (sort === 'piutang') {
                    return b.piutang - a.piutang;
                }

                if (sort === 'jatuhTempo') {
                    return b.jatuhTempo - a.jatuhTempo;
                }

                return b.totalOmzet - a.totalOmzet;
            });
    }, [customers, query, sort]);

    const totals = customers.reduce(
        (sum, customer) => ({
            omzet: sum.omzet + customer.totalOmzet,
            keuntungan: sum.keuntungan + customer.keuntungan,
            piutang: sum.piutang + customer.piutang,
            jatuhTempo: sum.jatuhTempo + customer.jatuhTempo,
        }),
        { omzet: 0, keuntungan: 0, piutang: 0, jatuhTempo: 0 },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/database/customer', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Database Customer" />
                <DatabaseContactSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Database Customer" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Database Customer
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola kontak customer, pantau omzet, piutang, jatuh
                            tempo, dan riwayat transaksi.
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Tambah Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submit}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Customer</DialogTitle>
                                    <DialogDescription>
                                        Data kontak ini akan dipakai untuk
                                        penjualan, invoice, piutang, dan
                                        laporan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Field label="Nama" required>
                                        <Input
                                            name="nama"
                                            placeholder="Nama customer"
                                            required
                                        />
                                    </Field>
                                    <Field label="Kontak">
                                        <Input
                                            name="telepon"
                                            placeholder="No HP / WA / email / PIC"
                                        />
                                    </Field>
                                    <Field label="Alamat">
                                        <Textarea name="alamat" rows={2} />
                                    </Field>
                                    <Field label="Keterangan">
                                        <Textarea name="catatan" rows={2} />
                                    </Field>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="size-4" />
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Customer"
                        value={customers.length.toString()}
                        description="Kontak aktif di database"
                        icon={<Users className="size-5" />}
                    />
                    <StatCard
                        title="Total Omzet"
                        value={compactRupiah(totals.omzet)}
                        description="Akumulasi semua penjualan"
                        icon={<BadgeDollarSign className="size-5" />}
                    />
                    <StatCard
                        title="Keuntungan"
                        value={compactRupiah(totals.keuntungan)}
                        description="Omzet dikurangi HPP"
                        icon={<Star className="size-5" />}
                    />
                    <StatCard
                        title="Piutang Jatuh Tempo"
                        value={compactRupiah(totals.jatuhTempo)}
                        description="Tagihan perlu ditagih"
                        icon={<CalendarClock className="size-5" />}
                    />
                </section>

                <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    Daftar Customer
                                </CardTitle>
                                <CardDescription>
                                    Urutkan berdasarkan omzet, piutang, atau
                                    piutang jatuh tempo.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        className="pl-8 sm:w-72"
                                        placeholder="Cari customer..."
                                    />
                                </div>
                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(
                                            event.target.value as
                                                | 'omzet'
                                                | 'piutang'
                                                | 'jatuhTempo',
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="omzet">Omzet</option>
                                    <option value="piutang">Piutang</option>
                                    <option value="jatuhTempo">
                                        Piutang J.T.
                                    </option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Customer</th>
                                        <th className="px-3 py-2">Kontak</th>
                                        <th className="px-3 py-2">
                                            Terakhir Beli
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Omzet
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Keuntungan
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Piutang
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Piutang J.T.
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {customer.nama}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {customer.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {customer.transaksi}{' '}
                                                        transaksi
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>{customer.kontak}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {customer.alamat}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {customer.terakhirBeli}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {rupiah(customer.totalOmzet)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(customer.keuntungan)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(customer.piutang)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span
                                                    className={
                                                        customer.jatuhTempo > 0
                                                            ? 'font-semibold text-red-600'
                                                            : ''
                                                    }
                                                >
                                                    {rupiah(
                                                        customer.jatuhTempo,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    title="Detail"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <ActivityCard activities={activities} />
            </div>
        </>
    );
}

function ActivityCard({ activities }: { activities: Activity[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Riwayat Customer</CardTitle>
                <CardDescription>
                    Ringkasan transaksi terakhir, termasuk piutang belum lunas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-muted/60">
                            <tr className="text-left">
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Keterangan</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => (
                                <tr
                                    key={`${activity.tanggal}-${activity.customer}`}
                                    className="border-t"
                                >
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {activity.tanggal}
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {activity.customer}
                                    </td>
                                    <td className="px-3 py-2">
                                        {activity.keterangan}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            variant={
                                                activity.status === 'Lunas'
                                                    ? 'secondary'
                                                    : 'destructive'
                                            }
                                        >
                                            {activity.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(activity.nilai)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function DatabaseContactSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
            <Skeleton className="h-72 rounded-md" />
        </div>
    );
}
