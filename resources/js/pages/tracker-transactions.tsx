import { Head } from '@inertiajs/react';
import { CalendarDays, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Transaction = {
    id: string;
    tanggal: string;
    keterangan: string;
    pihak: string | null;
    jenis: string;
    nominal: number;
    kas: number;
    labaRugi: number;
    sisaTagihan: number;
    source: string;
};

type Props = {
    dateFrom: string;
    dateTo: string;
    transactions: Transaction[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function jenisVariant(jenis: string): 'default' | 'secondary' | 'outline' {
    if (jenis.includes('Penjualan') || jenis.includes('Penerimaan')) {
        return 'secondary';
    }

    if (jenis.includes('Transfer')) {
        return 'outline';
    }

    return 'default';
}

export default function TrackerTransactions({
    dateFrom,
    dateTo,
    transactions,
}: Props) {
    const [query, setQuery] = useState('');
    const [from, setFrom] = useState(dateFrom);
    const [to, setTo] = useState(dateTo);
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return transactions.filter((row) =>
            [row.id, row.keterangan, row.pihak ?? '', row.jenis, row.source]
                .join(' ')
                .toLowerCase()
                .includes(term),
        );
    }, [query, transactions]);

    const totals = filtered.reduce(
        (sum, row) => ({
            nominal: sum.nominal + row.nominal,
            kas: sum.kas + row.kas,
            labaRugi: sum.labaRugi + row.labaRugi,
            sisaTagihan: sum.sisaTagihan + row.sisaTagihan,
        }),
        { nominal: 0, kas: 0, labaRugi: 0, sisaTagihan: 0 },
    );

    if (showSkeleton) {
        return (
            <>
                <Head title="Daftar Transaksi" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Daftar Transaksi" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Daftar Transaksi
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Lihat dampak setiap transaksi ke nominal, kas, laba
                        rugi, dan sisa tagihan.
                    </p>
                </div>

                <Card className="border-border/70">
                    <CardContent className="grid gap-3 p-4 lg:grid-cols-[160px_160px_1fr_auto]">
                        <Input
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                        <Input
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                className="pl-8"
                                placeholder="Cari transaksi, pihak, jenis..."
                            />
                        </div>
                        <Button>
                            <CalendarDays className="size-4" />
                            Tampilkan
                        </Button>
                    </CardContent>
                </Card>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Nominal" value={rupiah(totals.nominal)} />
                    <Metric label="Kas Bergerak" value={rupiah(totals.kas)} />
                    <Metric label="Laba Rugi" value={rupiah(totals.labaRugi)} />
                    <Metric
                        label="Sisa Tagihan"
                        value={rupiah(totals.sisaTagihan)}
                    />
                </section>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Transaksi Periode
                        </CardTitle>
                        <CardDescription>
                            Periode {from} sampai {to}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[1080px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">
                                            ID Transaksi
                                        </th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">
                                            Keterangan
                                        </th>
                                        <th className="px-3 py-2">Jenis</th>
                                        <th className="px-3 py-2 text-right">
                                            Nominal
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Kas
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Laba Rugi
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Sisa Tagihan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((row) => (
                                        <tr key={row.id} className="border-t">
                                            <td className="px-3 py-3 font-mono text-xs">
                                                {row.id}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {row.tanggal}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {row.keterangan}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {row.pihak ?? 'Internal'} ·{' '}
                                                    {row.source}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={jenisVariant(
                                                        row.jenis,
                                                    )}
                                                >
                                                    {row.jenis}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {rupiah(row.nominal)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(row.kas)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(row.labaRugi)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(row.sisaTagihan)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card className="border-border/70">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <Skeleton className="h-20 rounded-md" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
