import { Head, Link } from '@inertiajs/react';
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

type Balance = { kode: string; nama: string; status: string; saldo: number };
type Props = {
    month: string;
    summary: Record<string, number>;
    balances: Balance[];
};

const links = [
    [
        'Bayar Pajak/Gaji',
        '/dashboard/pajak/setor',
        'Lunasi PPN, PPh, BPJS, atau gaji',
    ],
    [
        'Pembelian PKP',
        '/dashboard/pajak/pembelian-pkp',
        'Beli dengan PPN Masukan dan PPh 23',
    ],
    ['SPT Masa PPN', '/dashboard/pajak/spt-masa', 'Laporan bulanan PPN'],
    ['Rekap PPh 22', '/dashboard/pajak/pph22', 'Pemotongan instansi/BUMN'],
    [
        'Bukti Potong PPh23',
        '/dashboard/pajak/bukti-potong',
        'Bukti potong dari customer',
    ],
    [
        'Bukti Potong Keluar',
        '/dashboard/pajak/bukti-potong-keluar',
        'PPh 23 ke supplier',
    ],
    [
        'Bukti Bayar Pajak',
        '/dashboard/pajak/bukti-bayar',
        'Dokumen pembayaran pajak',
    ],
];

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function TaxHub({ month, summary, balances }: Props) {
    const showSkeleton = usePageSkeleton();
    if (showSkeleton) return <PageSkeleton />;

    return (
        <>
            <Head title="Hub Pajak" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Pajak PPN & PPh
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Dashboard pajak untuk PPN, PPh, BPJS, gaji, dan dokumen
                        bukti pajak.
                    </p>
                </div>
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label={`PPN Keluaran (${month})`}
                        value={rupiah(summary.ppnKeluaran)}
                    />
                    <Metric
                        label={`PPN Masukan (${month})`}
                        value={rupiah(summary.ppnMasukan)}
                    />
                    <Metric
                        label="Kurang Bayar PPN"
                        value={rupiah(summary.kurangBayar)}
                    />
                </section>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {links.map(([label, href, desc]) => (
                        <Card key={href} className="border-border/70">
                            <CardContent className="grid gap-3 p-4">
                                <div>
                                    <div className="font-semibold">{label}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {desc}
                                    </div>
                                </div>
                                <Button asChild variant="outline">
                                    <Link href={href}>Buka</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Saldo Akun Pajak & Gaji
                        </CardTitle>
                        <CardDescription>
                            Ringkasan saldo akun pajak real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-3 py-2 text-left">
                                            Kode
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Akun
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.map((row) => (
                                        <tr key={row.kode} className="border-t">
                                            <td className="px-3 py-2 font-mono text-xs">
                                                {row.kode}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {row.nama}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant="outline">
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {rupiah(row.saldo)}
                                            </td>
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
