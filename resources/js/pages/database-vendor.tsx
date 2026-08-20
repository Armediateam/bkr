import { Head, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    Eye,
    PackageCheck,
    Plus,
    Save,
    Search,
    Truck,
    WalletCards,
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

type Vendor = {
    id: number;
    nama: string;
    kontak: string;
    alamat: string;
    catatan: string;
    totalBelanja: number;
    hutang: number;
    jatuhTempo: number;
    terakhirBeli: string;
    transaksi: number;
};

type Activity = {
    tanggal: string;
    vendor: string;
    keterangan: string;
    nilai: number;
    status: string;
};

type Props = {
    vendors: Vendor[];
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

export default function DatabaseVendor({ vendors, activities }: Props) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'belanja' | 'hutang' | 'jatuhTempo'>(
        'belanja',
    );
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return vendors
            .filter((vendor) =>
                [vendor.nama, vendor.kontak, vendor.alamat]
                    .join(' ')
                    .toLowerCase()
                    .includes(term),
            )
            .sort((a, b) => {
                if (sort === 'hutang') {
                    return b.hutang - a.hutang;
                }

                if (sort === 'jatuhTempo') {
                    return b.jatuhTempo - a.jatuhTempo;
                }

                return b.totalBelanja - a.totalBelanja;
            });
    }, [vendors, query, sort]);

    const totals = vendors.reduce(
        (sum, vendor) => ({
            belanja: sum.belanja + vendor.totalBelanja,
            hutang: sum.hutang + vendor.hutang,
            jatuhTempo: sum.jatuhTempo + vendor.jatuhTempo,
            transaksi: sum.transaksi + vendor.transaksi,
        }),
        { belanja: 0, hutang: 0, jatuhTempo: 0, transaksi: 0 },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/database/vendor', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Database Vendor" />
                <DatabaseContactSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Database Vendor" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Database Vendor
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola pemasok, riwayat pembelian, hutang berjalan,
                            dan nominal yang sudah jatuh tempo.
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Tambah Vendor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submit}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Vendor</DialogTitle>
                                    <DialogDescription>
                                        Data vendor dipakai untuk pembelian,
                                        hutang, purchase order, dan laporan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Field label="Nama" required>
                                        <Input
                                            name="nama"
                                            placeholder="Nama vendor / pemasok"
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
                        title="Total Vendor"
                        value={vendors.length.toString()}
                        description="Pemasok aktif di database"
                        icon={<Truck className="size-5" />}
                    />
                    <StatCard
                        title="Total Belanja"
                        value={compactRupiah(totals.belanja)}
                        description="Akumulasi semua pembelian"
                        icon={<PackageCheck className="size-5" />}
                    />
                    <StatCard
                        title="Hutang Belum Lunas"
                        value={compactRupiah(totals.hutang)}
                        description="Saldo hutang vendor"
                        icon={<WalletCards className="size-5" />}
                    />
                    <StatCard
                        title="Hutang Jatuh Tempo"
                        value={compactRupiah(totals.jatuhTempo)}
                        description="Pembayaran perlu diproses"
                        icon={<CalendarClock className="size-5" />}
                    />
                </section>

                <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    Daftar Vendor
                                </CardTitle>
                                <CardDescription>
                                    Urutkan berdasarkan total belanja, hutang,
                                    atau hutang jatuh tempo.
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
                                        placeholder="Cari vendor..."
                                    />
                                </div>
                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(
                                            event.target.value as
                                                | 'belanja'
                                                | 'hutang'
                                                | 'jatuhTempo',
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="belanja">
                                        Total Belanja
                                    </option>
                                    <option value="hutang">Hutang</option>
                                    <option value="jatuhTempo">
                                        Hutang J.T.
                                    </option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[920px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Vendor</th>
                                        <th className="px-3 py-2">Kontak</th>
                                        <th className="px-3 py-2">
                                            Terakhir Beli
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Total Belanja
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Hutang
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Hutang J.T.
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((vendor) => (
                                        <tr
                                            key={vendor.id}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {vendor.nama}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {vendor.transaksi} transaksi
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>{vendor.kontak}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {vendor.alamat}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {vendor.terakhirBeli}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {rupiah(vendor.totalBelanja)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(vendor.hutang)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span
                                                    className={
                                                        vendor.jatuhTempo > 0
                                                            ? 'font-semibold text-red-600'
                                                            : ''
                                                    }
                                                >
                                                    {rupiah(vendor.jatuhTempo)}
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
                <CardTitle className="text-base">Riwayat Vendor</CardTitle>
                <CardDescription>
                    Ringkasan pembelian terakhir, termasuk hutang belum lunas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-muted/60">
                            <tr className="text-left">
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Vendor</th>
                                <th className="px-3 py-2">Keterangan</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => (
                                <tr
                                    key={`${activity.tanggal}-${activity.vendor}`}
                                    className="border-t"
                                >
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {activity.tanggal}
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {activity.vendor}
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
                <Skeleton className="h-10 w-36" />
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
