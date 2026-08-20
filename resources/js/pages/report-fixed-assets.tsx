import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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

type Asset = {
    id: number;
    nama: string;
    kategori: string;
    tanggalBeli: string;
    hargaBeli: number;
    penyusutanBulanan: number;
    terealisasi: number;
    nilaiBuku: number;
    umurBulan: number;
};
type Props = { assets: Asset[] };

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportFixedAssets({ assets }: Props) {
    const showSkeleton = usePageSkeleton();
    const totals = assets.reduce(
        (sum, asset) => ({
            hargaBeli: sum.hargaBeli + asset.hargaBeli,
            penyusutan: sum.penyusutan + asset.terealisasi,
            nilaiBuku: sum.nilaiBuku + asset.nilaiBuku,
        }),
        { hargaBeli: 0, penyusutan: 0, nilaiBuku: 0 },
    );

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Aset Tetap" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Aset Tetap
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Daftar aset tetap, penyusutan bulanan, penyusutan
                            terealisasi, dan nilai buku.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/pembelian">
                            <Plus className="size-4" />
                            Tambah via Pembelian
                        </Link>
                    </Button>
                </div>
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Harga Beli"
                        value={rupiah(totals.hargaBeli)}
                    />
                    <Metric
                        label="Akumulasi Penyusutan"
                        value={rupiah(totals.penyusutan)}
                    />
                    <Metric
                        label="Nilai Buku"
                        value={rupiah(totals.nilaiBuku)}
                    />
                </section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Daftar Aset Tetap
                        </CardTitle>
                        <CardDescription>
                            Penyusutan terealisasi dihitung proporsional dari
                            tanggal beli sampai bulan berjalan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-3 py-2 text-left">
                                            Aset
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Kategori
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Tanggal Beli
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Harga Beli
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Penyusutan/Bulan
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Terealisasi
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Nilai Buku
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Umur
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => (
                                        <tr key={asset.id} className="border-t">
                                            <td className="px-3 py-3 font-medium">
                                                {asset.nama}
                                            </td>
                                            <td className="px-3 py-3">
                                                {asset.kategori}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {asset.tanggalBeli}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(asset.hargaBeli)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(
                                                    asset.penyusutanBulanan,
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {rupiah(asset.terealisasi)}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {rupiah(asset.nilaiBuku)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {asset.umurBulan} bln
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
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
