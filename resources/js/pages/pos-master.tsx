import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    BarChart3,
    Clock3,
    CreditCard,
    Receipt,
    Users,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Kpis = {
    omzetPeriode: number;
    transaksiPeriode: number;
    omzetHariIni: number;
    transaksiHariIni: number;
    avgTrx: number;
    shiftAktif: number;
};

type PaymentSplit = {
    metode: string;
    nominal: number;
    transaksi: number;
};

type HourlyOrder = {
    jam: string;
    trx: number;
    omzet: number;
};

type RecentTransaction = {
    nomor: string;
    tanggal: string;
    kasir: string;
    metode: string;
    total: number;
};

type PosMasterProps = {
    kpis: Kpis;
    paymentSplit: PaymentSplit[];
    hourlyOrders: HourlyOrder[];
    recentTransactions: RecentTransaction[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function PosMaster({
    kpis,
    paymentSplit,
    hourlyOrders,
    recentTransactions,
}: PosMasterProps) {
    const showSkeleton = usePageSkeleton();
    const maxHourly = Math.max(...hourlyOrders.map((row) => row.omzet), 1);

    if (showSkeleton) {
        return (
            <>
                <Head title="Master POS" />
                <PosMasterSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Master POS" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Master POS
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Pantau performa POS, metode pembayaran, shift, dan
                            transaksi kasir.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/pos">Buka POS Kasir</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Omzet Periode"
                        value={rupiah(kpis.omzetPeriode)}
                        hint={`${kpis.transaksiPeriode} transaksi`}
                        icon={<Banknote className="size-5" />}
                    />
                    <KpiCard
                        title="Hari Ini"
                        value={rupiah(kpis.omzetHariIni)}
                        hint={`${kpis.transaksiHariIni} transaksi`}
                        icon={<Receipt className="size-5" />}
                    />
                    <KpiCard
                        title="Rata-rata / Trx"
                        value={rupiah(kpis.avgTrx)}
                        hint="average ticket size"
                        icon={<BarChart3 className="size-5" />}
                    />
                    <KpiCard
                        title="Shift Aktif"
                        value={String(kpis.shiftAktif)}
                        hint="kasir sedang buka"
                        icon={<Users className="size-5" />}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock3 className="size-5" />
                                Orderan per Jam
                            </CardTitle>
                            <CardDescription>
                                Ringkasan transaksi dan omzet per jam.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {hourlyOrders.map((row) => (
                                <div key={row.jam} className="grid gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">
                                            {row.jam}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {row.trx} trx - {rupiah(row.omzet)}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${Math.max((row.omzet / maxHourly) * 100, 4)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="size-5" />
                                Metode Bayar
                            </CardTitle>
                            <CardDescription>
                                Split pembayaran pada periode aktif.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {paymentSplit.map((row) => (
                                <div
                                    key={row.metode}
                                    className="flex items-center justify-between rounded-md border p-3"
                                >
                                    <div>
                                        <div className="font-medium">
                                            {row.metode}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.transaksi} transaksi
                                        </div>
                                    </div>
                                    <div className="font-semibold">
                                        {rupiah(row.nominal)}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Transaksi Terbaru
                        </CardTitle>
                        <CardDescription>
                            Daftar transaksi POS terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Nomor</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Kasir</th>
                                        <th className="px-3 py-2">Metode</th>
                                        <th className="px-3 py-2 text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((row) => (
                                        <tr
                                            key={row.nomor}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-2 font-medium">
                                                {row.nomor}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {row.tanggal}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.kasir}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.metode}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {rupiah(row.total)}
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

function KpiCard({
    title,
    value,
    hint,
    icon,
}: {
    title: string;
    value: string;
    hint: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{hint}</CardDescription>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </CardContent>
        </Card>
    );
}

function PosMasterSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-36 w-full rounded-md" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-80 w-full rounded-md" />
                <Skeleton className="h-80 w-full rounded-md" />
            </div>
            <Skeleton className="h-72 w-full rounded-md" />
        </div>
    );
}
