import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type AccountRow = { akun: string; nilai: number };
type Group = { kelompok: string; rows: AccountRow[] };
type Props = {
    dateTo: string;
    aset: Group[];
    liabilitas: Group[];
    ekuitas: AccountRow[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}
const groupTotal = (groups: Group[]) =>
    groups.reduce(
        (sum, group) => sum + group.rows.reduce((n, row) => n + row.nilai, 0),
        0,
    );

export default function ReportBalanceSheet({
    dateTo,
    aset,
    liabilitas,
    ekuitas,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const totalAset = groupTotal(aset);
    const totalLiabilitas = groupTotal(liabilitas);
    const totalEkuitas = ekuitas.reduce((sum, row) => sum + row.nilai, 0);
    const balanced = totalAset === totalLiabilitas + totalEkuitas;

    if (showSkeleton) return <PageSkeleton />;

    return (
        <>
            <Head title="Neraca" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Neraca
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Posisi aset, liabilitas, dan ekuitas per tanggal
                            laporan.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric label="Total Aset" value={rupiah(totalAset)} />
                    <Metric
                        label="Liabilitas + Ekuitas"
                        value={rupiah(totalLiabilitas + totalEkuitas)}
                    />
                    <Metric
                        label="Status Neraca"
                        value={balanced ? 'Seimbang' : 'Tidak Seimbang'}
                    />
                </section>
                <div className="grid gap-6 xl:grid-cols-2">
                    <GroupCard title="Aset" groups={aset} total={totalAset} />
                    <div className="grid gap-6">
                        <GroupCard
                            title="Liabilitas"
                            groups={liabilitas}
                            total={totalLiabilitas}
                        />
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Ekuitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {ekuitas.map((row) => (
                                            <Row
                                                key={row.akun}
                                                label={row.akun}
                                                value={row.nilai}
                                            />
                                        ))}
                                        <Row
                                            label="Total Ekuitas"
                                            value={totalEkuitas}
                                            strong
                                        />
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div
                    className={`rounded-md border p-3 text-sm ${balanced ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}
                >
                    {balanced
                        ? 'Neraca seimbang.'
                        : `Selisih aset vs liabilitas + ekuitas: ${rupiah(totalAset - totalLiabilitas - totalEkuitas)}.`}
                </div>
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
function GroupCard({
    title,
    groups,
    total,
}: {
    title: string;
    groups: Group[];
    total: number;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <tbody>
                        {groups.map((group) => [
                            <tr
                                key={group.kelompok}
                                className="bg-muted/30 font-semibold"
                            >
                                <td className="px-3 py-2" colSpan={2}>
                                    {group.kelompok}
                                </td>
                            </tr>,
                            ...group.rows.map((row) => (
                                <Row
                                    key={row.akun}
                                    label={row.akun}
                                    value={row.nilai}
                                />
                            )),
                            <Row
                                key={`${group.kelompok}-total`}
                                label={`Total ${group.kelompok}`}
                                value={group.rows.reduce(
                                    (sum, row) => sum + row.nilai,
                                    0,
                                )}
                                strong
                            />,
                        ])}
                        <Row label={`Total ${title}`} value={total} strong />
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
function Row({
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
function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Skeleton className="h-16 rounded-md" />
            <div className="grid gap-3 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
