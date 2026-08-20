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

type EquityRow = {
    label: string;
    type: 'opening' | 'addition' | 'deduction' | 'retained' | 'profit';
    amount: number;
};

type Props = {
    dateFrom: string;
    dateTo: string;
    rows: EquityRow[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportEquityChanges({ dateFrom, dateTo, rows }: Props) {
    const showSkeleton = usePageSkeleton();
    const additions = rows
        .filter((row) => row.amount > 0 && row.type !== 'opening')
        .reduce((sum, row) => sum + row.amount, 0);
    const deductions = rows
        .filter((row) => row.amount < 0)
        .reduce((sum, row) => sum + Math.abs(row.amount), 0);
    const ending = rows.reduce((sum, row) => sum + row.amount, 0);
    const profit = rows.find((row) => row.type === 'profit')?.amount ?? 0;

    if (showSkeleton) {
        return <PageSkeleton title="Laporan Perubahan Ekuitas" />;
    }

    return (
        <>
            <Head title="Perubahan Ekuitas" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Header
                    title="Laporan Perubahan Ekuitas"
                    description="Menjelaskan perubahan modal pemilik dari modal awal, setoran, prive, laba ditahan, dan laba bersih periode."
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Penambahan Ekuitas"
                        value={rupiah(additions)}
                    />
                    <Metric
                        label="Pengurangan Ekuitas"
                        value={rupiah(deductions)}
                    />
                    <Metric
                        label="Laba Bersih Periode"
                        value={rupiah(profit)}
                    />
                </section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Rincian Perubahan Modal
                        </CardTitle>
                        <CardDescription>
                            Periode {dateFrom} sampai {dateTo}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.label} className="border-t">
                                        <td className="px-3 py-3">
                                            {row.type === 'deduction'
                                                ? '- '
                                                : ''}
                                            {row.label}
                                        </td>
                                        <td
                                            className={`px-3 py-3 text-right font-medium ${
                                                row.amount < 0
                                                    ? 'text-red-600'
                                                    : ''
                                            }`}
                                        >
                                            {rupiah(row.amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t bg-muted/40 font-semibold">
                                    <td className="px-3 py-3">Modal Akhir</td>
                                    <td className="px-3 py-3 text-right">
                                        {rupiah(ending)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Header({
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
                <Skeleton className="h-96 rounded-md" />
            </div>
        </>
    );
}
