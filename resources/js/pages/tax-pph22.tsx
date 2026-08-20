import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
type Withheld = {
    tanggal: string;
    pihak: string;
    keterangan: string;
    dpp: number;
    pph22: number;
};
type Reversed = { tanggal: string; keterangan: string; nilai: number };
type Props = {
    month: string;
    year: number;
    withheld: Withheld[];
    reversed: Reversed[];
};
function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}
export default function TaxPph22({ month, year, withheld, reversed }: Props) {
    const showSkeleton = usePageSkeleton();
    const total = withheld.reduce((n, row) => n + row.pph22, 0);
    const totalReverse = reversed.reduce((n, row) => n + row.nilai, 0);
    if (showSkeleton) return <PageSkeleton title="Rekap PPh 22" />;
    return (
        <>
            <Head title="Rekap PPh 22" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Rekap PPh 22
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            PPh 22 dibayar dimuka - {month} {year}
                        </p>
                    </div>
                    <Button variant="outline">
                        <Printer className="size-4" />
                        Cetak
                    </Button>
                </div>
                <section className="grid gap-3 md:grid-cols-2">
                    <Metric label="PPh 22 Dipotong" value={rupiah(total)} />
                    <Metric
                        label="PPh 22 Dibalik"
                        value={rupiah(totalReverse)}
                    />
                </section>
                <PphTable rows={withheld} />
                <ReverseTable rows={reversed} />
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
function PphTable({ rows }: { rows: Withheld[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">
                    Rincian Pemotongan PPh 22
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Tanggal</th>
                                <th className="px-3 py-2 text-left">Pihak</th>
                                <th className="px-3 py-2 text-left">
                                    Keterangan
                                </th>
                                <th className="px-3 py-2 text-right">DPP</th>
                                <th className="px-3 py-2 text-right">PPh 22</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={`${row.tanggal}-${row.pihak}`}
                                    className="border-t"
                                >
                                    <td className="px-3 py-2">{row.tanggal}</td>
                                    <td className="px-3 py-2">{row.pihak}</td>
                                    <td className="px-3 py-2">
                                        {row.keterangan}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.dpp)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.pph22)}
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
function ReverseTable({ rows }: { rows: Reversed[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Pembalikan PPh 22</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.keterangan} className="border-t">
                                <td className="px-3 py-2">{row.tanggal}</td>
                                <td className="px-3 py-2">{row.keterangan}</td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(row.nilai)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                <Skeleton className="h-96 rounded-md" />
            </div>
        </>
    );
}
