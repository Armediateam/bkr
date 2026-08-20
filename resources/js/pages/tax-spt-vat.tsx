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
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Row = {
    tanggal: string;
    keterangan: string;
    pihak: string;
    nilai: number;
};
type Props = {
    month: string;
    year: number;
    ppnKeluaran: Row[];
    ppnMasukan: Row[];
    setoran: number;
};
function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}
const sum = (rows: Row[]) => rows.reduce((n, row) => n + row.nilai, 0);

export default function TaxSptVat({
    month,
    year,
    ppnKeluaran,
    ppnMasukan,
    setoran,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const keluar = sum(ppnKeluaran);
    const masuk = sum(ppnMasukan);
    const kurang = Math.max(keluar - masuk - setoran, 0);
    const lebih = Math.max(masuk + setoran - keluar, 0);
    if (showSkeleton) return <PageSkeleton title="SPT Masa PPN" />;
    return (
        <>
            <Head title="SPT Masa PPN" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Header title={`SPT Masa PPN - ${month} ${year}`} />
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric label="PPN Keluaran" value={rupiah(keluar)} />
                    <Metric label="PPN Masukan" value={rupiah(masuk)} />
                    <Metric
                        label={kurang > 0 ? 'Kurang Bayar' : 'Lebih Bayar'}
                        value={rupiah(kurang || lebih)}
                    />
                </section>
                <Info kurang={kurang} lebih={lebih} setoran={setoran} />
                <VatTable
                    title="Rincian PPN Keluaran"
                    rows={ppnKeluaran}
                    total={keluar}
                />
                <VatTable
                    title="Rincian PPN Masukan"
                    rows={ppnMasukan}
                    total={masuk}
                />
            </div>
        </>
    );
}
function Header({ title }: { title: string }) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    Laporan bulanan PPN keluaran dan masukan.
                </p>
            </div>
            <Button variant="outline">
                <Printer className="size-4" />
                Cetak
            </Button>
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
function Info({
    kurang,
    lebih,
    setoran,
}: {
    kurang: number;
    lebih: number;
    setoran: number;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="p-4 text-sm">
                {kurang > 0 ? (
                    <span>
                        <strong>Kewajiban Setor PPN:</strong> {rupiah(kurang)}{' '}
                        harus disetor ke kas negara.
                    </span>
                ) : (
                    <span>
                        PPN Masukan lebih besar. Selisih {rupiah(lebih)} bisa
                        dikompensasi ke masa berikutnya.
                    </span>
                )}
                <div className="mt-1 text-muted-foreground">
                    Sudah disetor bulan ini: {rupiah(setoran)}
                </div>
            </CardContent>
        </Card>
    );
}
function VatTable({
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
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Tanggal</th>
                                <th className="px-3 py-2 text-left">
                                    Keterangan
                                </th>
                                <th className="px-3 py-2 text-left">Pihak</th>
                                <th className="px-3 py-2 text-right">
                                    Nilai PPN
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={`${row.tanggal}-${row.keterangan}`}
                                    className="border-t"
                                >
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {row.tanggal}
                                    </td>
                                    <td className="px-3 py-2">
                                        {row.keterangan}
                                    </td>
                                    <td className="px-3 py-2">{row.pihak}</td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.nilai)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="border-t bg-muted/30 font-semibold">
                                <td
                                    className="px-3 py-2 text-right"
                                    colSpan={3}
                                >
                                    Total
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
