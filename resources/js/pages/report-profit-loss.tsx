import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
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

type Row = { akun: string; nilai: number };
type Props = {
    dateFrom: string;
    dateTo: string;
    pendapatan: Row[];
    beban: Row[];
    summary: {
        pendapatan: number;
        hpp: number;
        bebanOperasional: number;
        pajak: number;
    };
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportProfitLoss({
    dateFrom,
    dateTo,
    pendapatan,
    beban,
    summary,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const labaKotor = summary.pendapatan - summary.hpp;
    const labaOperasional = labaKotor - summary.bebanOperasional;
    const labaBersih = labaOperasional - summary.pajak;
    const totalBeban = summary.hpp + summary.bebanOperasional + summary.pajak;

    if (showSkeleton) {
        return <PageSkeleton title="Laporan Laba Rugi" />;
    }

    return (
        <>
            <Head title="Laba Rugi" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <ReportHeader
                    title="Laporan Laba Rugi"
                    description="Pendapatan dikurangi HPP, beban operasional, dan pajak untuk menghitung laba bersih."
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Total Pendapatan"
                        value={rupiah(summary.pendapatan)}
                    />
                    <Metric label="Total Beban" value={rupiah(totalBeban)} />
                    <Metric
                        label="Laba / Rugi Bersih"
                        value={rupiah(labaBersih)}
                    />
                </section>
                <div className="grid gap-6 xl:grid-cols-2">
                    <Breakdown
                        title="Pendapatan"
                        rows={pendapatan}
                        total={summary.pendapatan}
                    />
                    <Breakdown title="Beban" rows={beban} total={totalBeban} />
                </div>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Ringkasan Laba Rugi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                <SummaryRow
                                    label="Pendapatan"
                                    value={summary.pendapatan}
                                />
                                <SummaryRow
                                    label="Harga Pokok Penjualan (HPP)"
                                    value={-summary.hpp}
                                />
                                <SummaryRow
                                    label="Laba Kotor"
                                    value={labaKotor}
                                    strong
                                />
                                <SummaryRow
                                    label="Beban Operasional"
                                    value={-summary.bebanOperasional}
                                />
                                <SummaryRow
                                    label="Laba Operasional"
                                    value={labaOperasional}
                                    strong
                                />
                                <SummaryRow
                                    label="Beban Pajak"
                                    value={-summary.pajak}
                                />
                                <SummaryRow
                                    label="Laba Bersih"
                                    value={labaBersih}
                                    strong
                                />
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function ReportHeader({
    title,
    description,
    dateFrom,
    dateTo,
}: {
    title: string;
    description: string;
    dateFrom: string;
    dateTo: string;
}) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Input type="date" defaultValue={dateFrom} className="w-40" />
                <Input type="date" defaultValue={dateTo} className="w-40" />
                <Button variant="outline">
                    <Printer className="size-4" />
                    Cetak
                </Button>
            </div>
        </div>
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

function Breakdown({
    title,
    rows,
    total,
}: {
    title: string;
    rows: Row[];
    total: number;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>Breakdown per akun.</CardDescription>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <tbody>
                        {rows.map((row) => (
                            <SummaryRow
                                key={row.akun}
                                label={row.akun}
                                value={row.nilai}
                            />
                        ))}
                        <SummaryRow
                            label={`Total ${title}`}
                            value={total}
                            strong
                        />
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <tr
            className={
                strong ? 'border-t bg-muted/30 font-semibold' : 'border-t'
            }
        >
            <td className="px-3 py-2">{label}</td>
            <td className="px-3 py-2 text-right">{rupiah(value)}</td>
        </tr>
    );
}

function PageSkeleton({ title }: { title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Skeleton className="h-16 rounded-md" />
                <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-80 rounded-md" />
            </div>
        </>
    );
}
