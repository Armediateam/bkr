import { Head, useForm } from '@inertiajs/react';
import { Copy, Save, Trash2 } from 'lucide-react';
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

type BudgetRow = {
    accountCode: string;
    accountName: string;
    budget: number;
    actual: number;
};

type Account = { code: string; name: string };
type Props = {
    period: { month: string; year: number };
    targetRevenue: number;
    actualRevenue: number;
    budgetRows: BudgetRow[];
    expenseAccounts: Account[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function BudgetTarget({
    period,
    targetRevenue,
    actualRevenue,
    budgetRows,
    expenseAccounts,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const { data, setData, post, processing } = useForm({
        month: period.month,
        year: String(period.year),
        targetRevenue: String(targetRevenue),
        accountCode: expenseAccounts[0]?.code ?? '',
        amount: '',
    });

    if (showSkeleton) return <PageSkeleton />;

    const totalBudget = budgetRows.reduce((sum, row) => sum + row.budget, 0);
    const totalActual = budgetRows.reduce((sum, row) => sum + row.actual, 0);
    const revenueProgress = targetRevenue
        ? (actualRevenue / targetRevenue) * 100
        : 0;

    return (
        <>
            <Head title="Anggaran & Target" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Modul Anggaran
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Anggaran & Target
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Tetapkan target pendapatan dan anggaran beban per
                            akun, lalu pantau realisasi dari buku besar.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={data.month}
                            onChange={(event) =>
                                setData('month', event.target.value)
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
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <Input
                            className="w-24"
                            type="number"
                            value={data.year}
                            onChange={(event) =>
                                setData('year', event.target.value)
                            }
                        />
                        <Button variant="outline">
                            <Copy className="size-4" />
                            Salin Bulan Lalu
                        </Button>
                    </div>
                </div>

                <section className="grid gap-3 md:grid-cols-4">
                    <Metric
                        label="Target Pendapatan"
                        value={rupiah(targetRevenue)}
                    />
                    <Metric
                        label="Realisasi Pendapatan"
                        value={rupiah(actualRevenue)}
                    />
                    <Metric
                        label="Total Anggaran Beban"
                        value={rupiah(totalBudget)}
                    />
                    <Metric
                        label="Realisasi Beban"
                        value={rupiah(totalActual)}
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Pendapatan</CardTitle>
                            <CardDescription>
                                Periode {period.month} {period.year}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Progress
                                label="Progress realisasi"
                                value={revenueProgress}
                            />
                            <form
                                className="grid gap-3 sm:grid-cols-[1fr_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    post('/dashboard/anggaran');
                                }}
                            >
                                <div className="grid gap-2">
                                    <Label>Target Baru</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.targetRevenue}
                                        onChange={(event) =>
                                            setData(
                                                'targetRevenue',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    className="self-end"
                                    disabled={processing}
                                >
                                    <Save className="size-4" />
                                    Simpan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Anggaran Beban</CardTitle>
                            <CardDescription>
                                Sisa anggaran{' '}
                                {rupiah(totalBudget - totalActual)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Progress
                                label="Realisasi beban"
                                value={
                                    totalBudget
                                        ? (totalActual / totalBudget) * 100
                                        : 0
                                }
                                danger={totalActual > totalBudget}
                            />
                            <div className="grid gap-2 sm:grid-cols-3">
                                <Mini label="Anggaran" value={totalBudget} />
                                <Mini label="Realisasi" value={totalActual} />
                                <Mini
                                    label="Selisih"
                                    value={totalBudget - totalActual}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Anggaran Beban</CardTitle>
                        <CardDescription>
                            Anggaran dan realisasi per akun beban.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead className="border-b text-left text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-4">Akun</th>
                                    <th className="py-2 pr-4 text-right">
                                        Anggaran
                                    </th>
                                    <th className="py-2 pr-4 text-right">
                                        Realisasi
                                    </th>
                                    <th className="py-2 pr-4 text-right">
                                        Selisih
                                    </th>
                                    <th className="py-2 pr-4">Progress</th>
                                    <th className="py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetRows.map((row) => {
                                    const progress = row.budget
                                        ? (row.actual / row.budget) * 100
                                        : 0;
                                    const variance = row.budget - row.actual;
                                    return (
                                        <tr
                                            key={row.accountCode}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">
                                                    {row.accountName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.accountCode}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-right">
                                                {rupiah(row.budget)}
                                            </td>
                                            <td className="py-3 pr-4 text-right">
                                                {rupiah(row.actual)}
                                            </td>
                                            <td
                                                className={`py-3 pr-4 text-right font-medium ${variance < 0 ? 'text-destructive' : 'text-emerald-600'}`}
                                            >
                                                {rupiah(variance)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Progress
                                                    label={`${progress.toFixed(1)}%`}
                                                    value={progress}
                                                    compact
                                                    danger={progress > 100}
                                                />
                                            </td>
                                            <td className="py-3 text-right">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Pos Anggaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                post('/dashboard/anggaran');
                            }}
                        >
                            <div className="grid gap-2">
                                <Label>Akun Beban</Label>
                                <select
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                    value={data.accountCode}
                                    onChange={(event) =>
                                        setData(
                                            'accountCode',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {expenseAccounts.map((account) => (
                                        <option
                                            key={account.code}
                                            value={account.code}
                                        >
                                            {account.code} - {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Nominal Anggaran</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                />
                            </div>
                            <Button className="self-end" disabled={processing}>
                                Tambah Pos
                            </Button>
                        </form>
                    </CardContent>
                </Card>
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

function Mini({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-semibold">{rupiah(value)}</div>
        </div>
    );
}

function Progress({
    label,
    value,
    danger = false,
    compact = false,
}: {
    label: string;
    value: number;
    danger?: boolean;
    compact?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                {!compact && (
                    <Badge variant={danger ? 'destructive' : 'secondary'}>
                        {value.toFixed(1)}%
                    </Badge>
                )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full ${danger ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
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
