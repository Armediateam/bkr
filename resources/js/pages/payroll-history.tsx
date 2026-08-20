import { Head, Link } from '@inertiajs/react';
import { Calculator, Printer, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

type PayrollHistoryRow = {
    id: string;
    employeeNumber: string;
    name: string;
    gross: number;
    bpjs: number;
    pph21: number;
    netPay: number;
};

type PayrollPeriod = {
    period: string;
    processedAt: string;
    status: string;
    employeeCount: number;
    gross: number;
    bpjs: number;
    pph21: number;
    netPay: number;
    rows: PayrollHistoryRow[];
};

type Props = { periods: PayrollPeriod[] };

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function PayrollHistory({ periods }: Props) {
    const showSkeleton = usePageSkeleton();
    if (showSkeleton) return <PageSkeleton />;

    return (
        <>
            <Head title="Riwayat Gaji" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Modul Gaji
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Riwayat Gaji
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Payroll dikelompokkan per periode dengan total
                            bruto, BPJS, PPh 21, take-home pay, dan akses slip.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/gaji/proses">
                            <Calculator className="size-4" />
                            Proses Gaji Baru
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-3 md:grid-cols-4">
                    <Metric label="Periode" value={periods.length.toString()} />
                    <Metric
                        label="Total Bruto"
                        value={rupiah(
                            periods.reduce(
                                (sum, period) => sum + period.gross,
                                0,
                            ),
                        )}
                    />
                    <Metric
                        label="Total PPh 21"
                        value={rupiah(
                            periods.reduce(
                                (sum, period) => sum + period.pph21,
                                0,
                            ),
                        )}
                    />
                    <Metric
                        label="Total THP"
                        value={rupiah(
                            periods.reduce(
                                (sum, period) => sum + period.netPay,
                                0,
                            ),
                        )}
                    />
                </section>

                <div className="grid gap-4">
                    {periods.map((period) => (
                        <Card key={period.period}>
                            <CardHeader className="gap-3">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {period.period}
                                            <Badge
                                                variant={
                                                    period.status === 'Terbayar'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {period.status}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            {period.employeeCount} karyawan -
                                            diproses {period.processedAt}
                                        </CardDescription>
                                    </div>
                                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                                        <Summary
                                            label="Bruto"
                                            value={period.gross}
                                        />
                                        <Summary
                                            label="PPh 21"
                                            value={period.pph21}
                                        />
                                        <Summary
                                            label="THP"
                                            value={period.netPay}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[840px] text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="py-2 pr-4">ID</th>
                                            <th className="py-2 pr-4">
                                                Karyawan
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Bruto
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                BPJS
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                PPh 21
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                THP
                                            </th>
                                            <th className="py-2 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {period.rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4 font-medium">
                                                    {row.id}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium">
                                                        {row.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.employeeNumber}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.gross)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.bpjs)}
                                                </td>
                                                <td className="py-3 pr-4 text-right text-destructive">
                                                    {rupiah(row.pph21)}
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold text-emerald-600">
                                                    {rupiah(row.netPay)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="icon"
                                                            variant="outline"
                                                        >
                                                            <Link
                                                                href={`/dashboard/gaji/slip/${row.id}`}
                                                            >
                                                                <Printer className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="mt-1 text-lg font-semibold">{value}</div>
            </CardContent>
        </Card>
    );
}

function Summary({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border px-3 py-2 text-right">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-semibold">{rupiah(value)}</div>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-xl p-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-3 md:grid-cols-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-[420px] w-full" />
            <Skeleton className="h-[360px] w-full" />
        </div>
    );
}
