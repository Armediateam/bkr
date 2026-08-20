import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
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

type Summary = { label: string; value: string; note: string };
type Ratio = { name: string; value: string; status: string; formula: string };
type Group = { title: string; description: string; ratios: Ratio[] };
type SourceRow = { label: string; value: number };
type Props = {
    dateFrom: string;
    dateTo: string;
    summary: Summary[];
    groups: Group[];
    source: SourceRow[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportRatioAnalysis({
    dateFrom,
    dateTo,
    summary,
    groups,
    source,
}: Props) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Analisis Rasio" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Analisis Rasio Keuangan
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Rasio likuiditas, solvabilitas, profitabilitas, dan
                            perputaran inventory dari laporan keuangan periode.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            type="date"
                            defaultValue={dateFrom}
                            className="w-40"
                        />
                        <Input
                            type="date"
                            defaultValue={dateTo}
                            className="w-40"
                        />
                        <Button variant="outline">
                            <Printer className="size-4" />
                            Cetak
                        </Button>
                    </div>
                </div>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.label} className="border-border/70">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.note}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                {groups.map((group) => (
                    <Card key={group.title} className="border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {group.title}
                            </CardTitle>
                            <CardDescription>
                                {group.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {group.ratios.map((ratio) => (
                                <div
                                    key={ratio.name}
                                    className="rounded-md border p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {ratio.name}
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold">
                                                {ratio.value}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {ratio.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {ratio.formula}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Sumber Angka Utama
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                {source.map((row) => (
                                    <tr key={row.label} className="border-t">
                                        <td className="px-3 py-2">
                                            {row.label}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {rupiah(row.value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Skeleton className="h-16 rounded-md" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
