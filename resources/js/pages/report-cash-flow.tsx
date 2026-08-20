import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type CashRow = { label: string; masuk: number; keluar: number };
type Section = { kategori: string; rows: CashRow[] };
type Props = {
    dateFrom: string;
    dateTo: string;
    saldoAwal: number;
    sections: Section[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportCashFlow({
    dateFrom,
    dateTo,
    saldoAwal,
    sections,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const totals = sections.reduce(
        (sum, section) => {
            const masuk = section.rows.reduce((n, row) => n + row.masuk, 0);
            const keluar = section.rows.reduce((n, row) => n + row.keluar, 0);
            return { masuk: sum.masuk + masuk, keluar: sum.keluar + keluar };
        },
        { masuk: 0, keluar: 0 },
    );
    const saldoAkhir = saldoAwal + totals.masuk - totals.keluar;

    if (showSkeleton) return <PageSkeleton />;

    return (
        <>
            <Head title="Arus Kas" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Laporan Arus Kas
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Arus kas dihitung dari transaksi yang melibatkan
                            akun kas dan bank, dikelompokkan ke operasional,
                            investasi, dan pendanaan.
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
                <section className="grid gap-3 md:grid-cols-4">
                    <Metric
                        label="Total Uang Masuk"
                        value={rupiah(totals.masuk)}
                    />
                    <Metric
                        label="Total Uang Keluar"
                        value={rupiah(totals.keluar)}
                    />
                    <Metric
                        label="Selisih Periode"
                        value={rupiah(totals.masuk - totals.keluar)}
                    />
                    <Metric
                        label="Saldo Akhir Kas & Bank"
                        value={rupiah(saldoAkhir)}
                    />
                </section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Ringkasan Arus Kas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full max-w-2xl text-sm">
                            <tbody>
                                <Row
                                    label="Saldo Kas & Bank Awal"
                                    value={saldoAwal}
                                />
                                {sections.map((section) => {
                                    const net = section.rows.reduce(
                                        (n, row) => n + row.masuk - row.keluar,
                                        0,
                                    );
                                    return (
                                        <Row
                                            key={section.kategori}
                                            label={`+ Kas bersih dari ${section.kategori.replace('Aktivitas ', '').toLowerCase()}`}
                                            value={net}
                                        />
                                    );
                                })}
                                <Row
                                    label="Saldo Kas & Bank Akhir"
                                    value={saldoAkhir}
                                    strong
                                />
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                {sections.map((section) => (
                    <Card key={section.kategori} className="border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {section.kategori}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full min-w-[680px] text-sm">
                                    <thead className="bg-muted/60">
                                        <tr>
                                            <th className="px-3 py-2 text-left">
                                                Keterangan
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Masuk
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Keluar
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Net
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.rows.map((row) => (
                                            <tr
                                                key={row.label}
                                                className="border-t"
                                            >
                                                <td className="px-3 py-2">
                                                    {row.label}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {rupiah(row.masuk)}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {rupiah(row.keluar)}
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium">
                                                    {rupiah(
                                                        row.masuk - row.keluar,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
            <div className="grid gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
