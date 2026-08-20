import { Head, Link, useForm } from '@inertiajs/react';
import { Calculator, FileText } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type PayrollRow = {
    employeeNumber: string;
    name: string;
    position: string;
    baseSalary: number;
    allowance: number;
    meal: number;
    transport: number;
    bonus: number;
    bpjs: number;
    pph21: number;
    netPay: number;
};

type Props = {
    period: { month: string; year: number };
    payrollRows: PayrollRow[];
    summary: { gross: number; bpjs: number; pph21: number; netPay: number };
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function PayrollProcess({
    period,
    payrollRows,
    summary,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const { data, setData, post, processing } = useForm({
        month: period.month,
        year: String(period.year),
        note: '',
        meal: '0',
        transport: '0',
        bonus: '0',
        other: '0',
    });

    if (showSkeleton) return <PageSkeleton />;

    return (
        <>
            <Head title="Proses Gaji" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Modul Gaji
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Proses Gaji Bulanan
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Preview slip, komponen variabel, PPh 21, BPJS, dan
                            jurnal payroll untuk periode berjalan.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/gaji/riwayat">
                            <FileText className="size-4" />
                            Riwayat Gaji
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-3 md:grid-cols-4">
                    <Metric label="Bruto" value={rupiah(summary.gross)} />
                    <Metric
                        label="BPJS Karyawan"
                        value={rupiah(summary.bpjs)}
                    />
                    <Metric label="PPh 21" value={rupiah(summary.pph21)} />
                    <Metric
                        label="Take-Home Pay"
                        value={rupiah(summary.netPay)}
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parameter Proses</CardTitle>
                            <CardDescription>
                                Komponen variabel per periode mengikuti form
                                proses gaji finansial custom.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="grid gap-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    post('/dashboard/gaji/proses');
                                }}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Bulan">
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={data.month}
                                            onChange={(event) =>
                                                setData(
                                                    'month',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {[
                                                'Januari',
                                                'Februari',
                                                'Maret',
                                                'April',
                                                'Mei',
                                                'Juni',
                                                'Juli',
                                                'Agustus',
                                                'September',
                                                'Oktober',
                                                'November',
                                                'Desember',
                                            ].map((month) => (
                                                <option
                                                    key={month}
                                                    value={month}
                                                >
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Tahun">
                                        <Input
                                            type="number"
                                            value={data.year}
                                            onChange={(event) =>
                                                setData(
                                                    'year',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <Field label="Catatan">
                                    <Input
                                        value={data.note}
                                        onChange={(event) =>
                                            setData('note', event.target.value)
                                        }
                                        placeholder="Catatan payroll opsional"
                                    />
                                </Field>
                                <div className="grid gap-3">
                                    <Field label="Uang Makan">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.meal}
                                            onChange={(event) =>
                                                setData(
                                                    'meal',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Uang Transport">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.transport}
                                            onChange={(event) =>
                                                setData(
                                                    'transport',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Bonus / THR">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.bonus}
                                            onChange={(event) =>
                                                setData(
                                                    'bonus',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Lain-lain">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.other}
                                            onChange={(event) =>
                                                setData(
                                                    'other',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <Button disabled={processing}>
                                    <Calculator className="size-4" />
                                    Proses & Catat Jurnal
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Slip Gaji</CardTitle>
                                <CardDescription>
                                    Periode {period.month} {period.year}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="py-2 pr-4">
                                                Karyawan
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Pokok
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Tunjangan
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Makan
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Transport
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                BPJS
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                PPh 21
                                            </th>
                                            <th className="py-2 text-right">
                                                THP
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollRows.map((row) => (
                                            <tr
                                                key={row.employeeNumber}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium">
                                                        {row.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.employeeNumber} -{' '}
                                                        {row.position}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.baseSalary)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.allowance)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.meal)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.transport)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(row.bpjs)}
                                                </td>
                                                <td className="py-3 pr-4 text-right text-destructive">
                                                    {rupiah(row.pph21)}
                                                </td>
                                                <td className="py-3 text-right font-semibold text-emerald-600">
                                                    {rupiah(row.netPay)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Jurnal Payroll</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <JournalBadge
                                    label="Dr 6100 Beban Gaji"
                                    value={summary.gross}
                                />
                                <JournalBadge
                                    label="Cr 2120 Hutang Gaji"
                                    value={summary.netPay}
                                />
                                <JournalBadge
                                    label="Cr 2130 Hutang PPh 21"
                                    value={summary.pph21}
                                />
                                <JournalBadge
                                    label="Cr 2140 Hutang BPJS"
                                    value={summary.bpjs}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
        </div>
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

function JournalBadge({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border p-3">
            <Badge variant="outline">{label}</Badge>
            <div className="mt-2 text-sm font-semibold">{rupiah(value)}</div>
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
            <Skeleton className="h-[520px] w-full" />
        </div>
    );
}
