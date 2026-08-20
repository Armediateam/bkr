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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Totals = {
    omzetNet: number;
    margin: number;
    marginPct: number;
    qtyNet: number;
    activeProducts: number;
    retur: number;
    hppNet: number;
};
type Category = {
    kategori: string;
    produk: number;
    omzet: number;
    kontribusi: number;
    margin: number;
};
type Product = {
    produk: string;
    kategori: string;
    qty: number;
    omzet: number;
    hpp: number;
    margin: number;
};
type Customer = {
    customer: string;
    transaksi: number;
    omzet: number;
    margin: number;
    aov: number;
};
type Monthly = {
    periode: string;
    transaksi: number;
    penjualan: number;
    retur: number;
    net: number;
};
type Props = {
    dateFrom: string;
    dateTo: string;
    totals: Totals;
    categories: Category[];
    products: Product[];
    customers: Customer[];
    monthly: Monthly[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportSalesPerformance({
    dateFrom,
    dateTo,
    totals,
    categories,
    products,
    customers,
    monthly,
}: Props) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Performa Penjualan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Header
                    title="Top Performa Produk & Penjualan"
                    description="Analisis omzet produk bersih, HPP, margin, top customer, dan tren bulanan."
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Omzet Produk Bersih"
                        value={rupiah(totals.omzetNet)}
                        note="Setelah retur produk"
                    />
                    <Metric
                        label="Margin Kotor Produk"
                        value={rupiah(totals.margin)}
                        note={`${totals.marginPct}% dari omzet produk`}
                    />
                    <Metric
                        label="Qty Terjual Bersih"
                        value={totals.qtyNet.toString()}
                        note={`${totals.activeProducts} produk aktif`}
                    />
                </section>
                <section className="grid gap-3 md:grid-cols-2">
                    <Metric
                        label="Retur Produk"
                        value={rupiah(totals.retur)}
                        note="Mengurangi omzet produk"
                    />
                    <Metric
                        label="HPP Produk Bersih"
                        value={rupiah(totals.hppNet)}
                        note="Mutasi stok ke HPP"
                    />
                </section>
                <div className="grid gap-6 xl:grid-cols-2">
                    <CategoryTable rows={categories} />
                    <CustomerTable rows={customers} />
                </div>
                <ProductTable rows={products} />
                <MonthlyTable rows={monthly} />
            </div>
        </>
    );
}

function Header({
    title,
    description,
    dateFrom,
    dateTo,
}: {
    title: string;
    description: string;
    dateFrom: string;
    dateTo: string;
}) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Input type="date" defaultValue={dateFrom} className="w-40" />
                <Input type="date" defaultValue={dateTo} className="w-40" />
                <Button variant="outline">
                    <Printer className="size-4" />
                    Cetak
                </Button>
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note: string;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </CardContent>
        </Card>
    );
}

function CategoryTable({ rows }: { rows: Category[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Performa Kategori</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left">Kategori</th>
                            <th className="px-3 py-2 text-right">Produk</th>
                            <th className="px-3 py-2 text-right">Omzet</th>
                            <th className="px-3 py-2 text-right">Kontribusi</th>
                            <th className="px-3 py-2 text-right">Margin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.kategori} className="border-t">
                                <td className="px-3 py-2">{row.kategori}</td>
                                <td className="px-3 py-2 text-right">
                                    {row.produk}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(row.omzet)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {row.kontribusi}%
                                </td>
                                <td className="px-3 py-2 text-right font-medium">
                                    {rupiah(row.margin)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

function ProductTable({ rows }: { rows: Product[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Top Performa Produk</CardTitle>
                <CardDescription>
                    Margin produk = omzet net dikurangi HPP produk.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Produk</th>
                                <th className="px-3 py-2 text-left">
                                    Kategori
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Qty Net
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Omzet Net
                                </th>
                                <th className="px-3 py-2 text-right">HPP</th>
                                <th className="px-3 py-2 text-right">Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.produk} className="border-t">
                                    <td className="px-3 py-2 font-medium">
                                        {row.produk}
                                    </td>
                                    <td className="px-3 py-2">
                                        {row.kategori}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {row.qty}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.omzet)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.hpp)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.margin)}
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

function CustomerTable({ rows }: { rows: Customer[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Top Customer</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left">Customer</th>
                            <th className="px-3 py-2 text-right">Transaksi</th>
                            <th className="px-3 py-2 text-right">Omzet</th>
                            <th className="px-3 py-2 text-right">Margin</th>
                            <th className="px-3 py-2 text-right">AOV</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.customer} className="border-t">
                                <td className="px-3 py-2 font-medium">
                                    {row.customer}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {row.transaksi}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(row.omzet)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(row.margin)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {rupiah(row.aov)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

function MonthlyTable({ rows }: { rows: Monthly[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">Tren Bulanan Produk</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Periode</th>
                                <th className="px-3 py-2 text-right">
                                    Transaksi
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Penjualan Produk
                                </th>
                                <th className="px-3 py-2 text-right">Retur</th>
                                <th className="px-3 py-2 text-right">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.periode} className="border-t">
                                    <td className="px-3 py-2">{row.periode}</td>
                                    <td className="px-3 py-2 text-right">
                                        {row.transaksi}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(row.penjualan)}
                                    </td>
                                    <td className="px-3 py-2 text-right text-red-600">
                                        {rupiah(row.retur)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.net)}
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
