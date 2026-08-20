import { Head } from '@inertiajs/react';
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

type Row = Record<string, string | number>;
type Props = { rows: Row[] };
function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function TaxDocumentList({ rows }: Props) {
    const showSkeleton = usePageSkeleton();
    const sample = rows[0] ?? {};
    const isPayment = 'jenis' in sample;
    const isOut = 'supplier' in sample;
    const title = isPayment
        ? 'Bukti Bayar Pajak'
        : isOut
          ? 'Bukti Potong PPh 23 Keluar'
          : 'Bukti Potong PPh 23';
    if (showSkeleton)
        return (
            <>
                <Head title={title} />
                <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    <Skeleton className="h-16 rounded-md" />
                    <Skeleton className="h-96 rounded-md" />
                </div>
            </>
        );
    return (
        <>
            <Head title={title} />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        {isPayment
                            ? 'Daftar transaksi Setor Pajak yang telah dicatat.'
                            : isOut
                              ? 'Daftar bukti potong PPh 23 yang diterbitkan ke supplier.'
                              : 'Daftar invoice yang memiliki potongan PPh 23 dari customer.'}
                    </p>
                </div>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Daftar Dokumen
                        </CardTitle>
                        <CardDescription>
                            Cetak dokumen dari baris yang tersedia.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        {isPayment ? (
                                            <>
                                                <th className="px-3 py-2 text-left">
                                                    Tanggal
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Nomor
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Jenis Pajak
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Akun
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Nominal
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Aksi
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-3 py-2 text-left">
                                                    Nomor
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Tanggal
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    {isOut
                                                        ? 'Supplier'
                                                        : 'Pemotong'}
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    NPWP
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    DPP
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    PPh23
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Status
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Aksi
                                                </th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr
                                            key={String(row.nomor)}
                                            className="border-t"
                                        >
                                            {isPayment ? (
                                                <>
                                                    <td className="px-3 py-2">
                                                        {row.tanggal}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono text-xs">
                                                        {row.nomor}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant="outline">
                                                            {row.jenis}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {row.akun}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {rupiah(
                                                            Number(row.nominal),
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Cetak
                                                        </Button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-3 py-2 font-mono text-xs">
                                                        {row.nomor}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {row.tanggal}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {isOut
                                                            ? row.supplier
                                                            : row.pemotong}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {row.npwp}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {rupiah(
                                                            Number(row.dpp),
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {rupiah(
                                                            Number(row.pph23),
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant="secondary">
                                                            {row.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Cetak
                                                        </Button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
