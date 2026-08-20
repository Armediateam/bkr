import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Kpi = { label: string; value: number; note: string };
type Monthly = {
    periode: string;
    pendapatan: number;
    labaKotor: number;
    labaOperasional: number;
    labaBersih: number;
    kas: number;
};
type Props = { kpis: Kpi[]; monthly: Monthly[] };

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportCharts({ kpis, monthly }: Props) {
    const [view, setView] = useState<'bulanan' | 'tahunan'>('bulanan');
    const showSkeleton = usePageSkeleton();
    const maxPendapatan = Math.max(...monthly.map((row) => row.pendapatan));
    const maxKas = Math.max(...monthly.map((row) => row.kas));
    const labaDitahan = useMemo(() => {
        let running = 0;
        return monthly.map((row) => {
            running += row.labaBersih;
            return { periode: row.periode, value: running };
        });
    }, [monthly]);

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Grafik" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Grafik & Analisis
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Visualisasi ringkas pendapatan, laba, saldo kas, dan
                            laba ditahan.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'bulanan' ? 'default' : 'outline'}
                            onClick={() => setView('bulanan')}
                        >
                            Bulanan
                        </Button>
                        <Button
                            variant={view === 'tahunan' ? 'default' : 'outline'}
                            onClick={() => setView('tahunan')}
                        >
                            5 Tahunan
                        </Button>
                    </div>
                </div>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((item) => (
                        <Card key={item.label} className="border-border/70">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-xl font-semibold">
                                    {rupiah(item.value)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.note}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                <div className="grid gap-6 xl:grid-cols-2">
                    <BarPanel
                        title="Pendapatan per Bulan"
                        rows={monthly.map((row) => ({
                            label: row.periode,
                            value: row.pendapatan,
                            max: maxPendapatan,
                        }))}
                    />
                    <LineTable title="Laba Bersih per Bulan" rows={monthly} />
                    <BarPanel
                        title="Akumulasi Saldo Kas & Bank"
                        rows={monthly.map((row) => ({
                            label: row.periode,
                            value: row.kas,
                            max: maxKas,
                        }))}
                    />
                    <BarPanel
                        title="Laba Ditahan Kumulatif"
                        rows={labaDitahan.map((row) => ({
                            label: row.periode,
                            value: row.value,
                            max: Math.max(...labaDitahan.map((x) => x.value)),
                        }))}
                    />
                </div>
            </div>
        </>
    );
}

function BarPanel({
    title,
    rows,
}: {
    title: string;
    rows: Array<{ label: string; value: number; max: number }>;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>
                    Bar relatif terhadap nilai terbesar.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                {rows.map((row) => (
                    <div key={row.label} className="grid gap-1">
                        <div className="flex justify-between gap-3 text-sm">
                            <span>{row.label}</span>
                            <span className="font-medium">
                                {rupiah(row.value)}
                            </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-sm bg-muted">
                            <div
                                className="h-full rounded-sm bg-primary"
                                style={{
                                    width: `${Math.max((row.value / row.max) * 100, 4)}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function LineTable({ title, rows }: { title: string; rows: Monthly[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[620px] text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Periode</th>
                                <th className="px-3 py-2 text-right">
                                    Laba Kotor
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Laba Operasional
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Laba Bersih
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.periode} className="border-t">
                                    <td className="px-3 py-2">{row.periode}</td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.labaKotor)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.labaOperasional)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.labaBersih)}
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

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Skeleton className="h-16 rounded-md" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
