import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    ClipboardList,
    FlaskConical,
    Plus,
    Save,
    Search,
    Upload,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Product = {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    satuan: string;
    stok: number;
    minStok: number;
    hargaBeli: number;
    hargaJual: number;
    terakhirBeli: string;
};

type NonSku = {
    saldo: number;
    rows: Array<{
        tanggal: string;
        deskripsi: string;
        transaksi: string;
        perubahan: number;
    }>;
};

type Props = {
    products: Product[];
    nonSku: NonSku;
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function compact(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(value);
}

function Field({
    label,
    children,
    required = false,
}: {
    label: string;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label>
                {label} {required && <span className="text-red-600">*</span>}
            </Label>
            {children}
        </div>
    );
}

function Stat({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="flex min-h-28 justify-between gap-4 p-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="h-fit rounded-md border bg-muted/40 p-2 text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

export default function InventoryStock({ products, nonSku }: Props) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'nama' | 'kode' | 'stok' | 'tgl'>('nama');
    const [minusOnly, setMinusOnly] = useState(false);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return products
            .filter((product) =>
                [product.kode, product.nama, product.kategori]
                    .join(' ')
                    .toLowerCase()
                    .includes(term),
            )
            .filter((product) => (minusOnly ? product.stok < 0 : true))
            .sort((a, b) => {
                if (sort === 'kode') return a.kode.localeCompare(b.kode);
                if (sort === 'stok') return b.stok - a.stok;
                if (sort === 'tgl')
                    return b.terakhirBeli.localeCompare(a.terakhirBeli);
                return a.nama.localeCompare(b.nama);
            });
    }, [minusOnly, products, query, sort]);

    const totals = products.reduce(
        (sum, product) => {
            const nilai = Math.max(product.stok, 0) * product.hargaBeli;

            return {
                nilai: sum.nilai + nilai,
                margin: sum.margin + (product.hargaJual - product.hargaBeli),
                warning:
                    sum.warning +
                    (product.stok < 0 ||
                    (product.minStok > 0 && product.stok <= product.minStok)
                        ? 1
                        : 0),
            };
        },
        { nilai: 0, margin: 0, warning: 0 },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/stok', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Inventory" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Inventory" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inventory / Produk
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola master produk, stok awal, koreksi opname,
                            valuasi persediaan, dan bahan non-SKU.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline">
                            <ClipboardList className="size-4" />
                            Export Opname
                        </Button>
                        <Button variant="outline">
                            <Upload className="size-4" />
                            Upload Excel
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="size-4" />
                                    Tambah Produk
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                                <form onSubmit={submit}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Tambah Produk Baru
                                        </DialogTitle>
                                        <DialogDescription>
                                            Stok awal dipakai untuk barang yang
                                            sudah dimiliki sebelum memakai
                                            aplikasi. Pembelian baru sebaiknya
                                            dicatat dari menu Pembelian.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4 md:grid-cols-2">
                                        <Field label="Kode Produk" required>
                                            <Input
                                                name="kode"
                                                placeholder="P001"
                                                required
                                            />
                                        </Field>
                                        <Field label="Nama Produk" required>
                                            <Input name="nama" required />
                                        </Field>
                                        <Field label="Kategori">
                                            <Input
                                                name="kategori"
                                                placeholder="Chemical, Pompa, Filter"
                                            />
                                        </Field>
                                        <Field label="Satuan">
                                            <Input
                                                name="satuan"
                                                defaultValue="pcs"
                                            />
                                        </Field>
                                        <Field label="Stok Saat Ini">
                                            <Input
                                                name="stok_awal"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                defaultValue="0"
                                            />
                                        </Field>
                                        <Field label="Harga Beli / HPP">
                                            <Input
                                                name="harga_beli"
                                                type="number"
                                                min="0"
                                                defaultValue="0"
                                            />
                                        </Field>
                                        <Field label="Harga Jual">
                                            <Input
                                                name="harga_jual"
                                                type="number"
                                                min="0"
                                                defaultValue="0"
                                            />
                                        </Field>
                                        <Field label="Min. Stok">
                                            <Input
                                                name="min_stok"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                defaultValue="0"
                                            />
                                        </Field>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Save className="size-4" />
                                            Simpan Produk
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Stat
                        title="Produk Terlacak"
                        value={products.length.toString()}
                        description="SKU aktif di inventory"
                        icon={<Boxes className="size-5" />}
                    />
                    <Stat
                        title="Valuasi SKU"
                        value={compact(totals.nilai)}
                        description="Stok x HPP rata-rata"
                        icon={<ClipboardList className="size-5" />}
                    />
                    <Stat
                        title="Persediaan Non-SKU"
                        value={compact(nonSku.saldo)}
                        description="Bahan umum tanpa stok unit"
                        icon={<FlaskConical className="size-5" />}
                    />
                    <Stat
                        title="Peringatan Stok"
                        value={totals.warning.toString()}
                        description="Minus atau di bawah minimum"
                        icon={<AlertTriangle className="size-5" />}
                    />
                </section>

                <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    Daftar Produk SKU
                                </CardTitle>
                                <CardDescription>
                                    Harga beli menjadi dasar valuasi persediaan
                                    dan HPP saat produk terjual.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        className="pl-8 sm:w-72"
                                        placeholder="Cari produk..."
                                    />
                                </div>
                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(
                                            event.target.value as
                                                | 'nama'
                                                | 'kode'
                                                | 'stok'
                                                | 'tgl',
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="nama">Nama A-Z</option>
                                    <option value="kode">Kode Barang</option>
                                    <option value="stok">Stok Terbanyak</option>
                                    <option value="tgl">
                                        Pembelian Terbaru
                                    </option>
                                </select>
                                <Button
                                    type="button"
                                    variant={minusOnly ? 'default' : 'outline'}
                                    onClick={() => setMinusOnly((v) => !v)}
                                >
                                    Stok Minus
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[1000px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Kode</th>
                                        <th className="px-3 py-2">
                                            Nama Produk
                                        </th>
                                        <th className="px-3 py-2">Kategori</th>
                                        <th className="px-3 py-2">Satuan</th>
                                        <th className="px-3 py-2 text-right">
                                            Harga Beli
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Harga Jual
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            Stok
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            Min.
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Nilai
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => {
                                        const warning =
                                            product.stok < 0 ||
                                            (product.minStok > 0 &&
                                                product.stok <=
                                                    product.minStok);

                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-t"
                                            >
                                                <td className="px-3 py-3 font-mono text-xs">
                                                    {product.kode}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-medium">
                                                        {product.nama}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Beli terakhir{' '}
                                                        {product.terakhirBeli}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Badge variant="outline">
                                                        {product.kategori ||
                                                            'Tanpa Kategori'}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {product.satuan}
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    {rupiah(product.hargaBeli)}
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    {rupiah(product.hargaJual)}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span
                                                        className={
                                                            warning
                                                                ? 'font-semibold text-red-600'
                                                                : 'font-medium'
                                                        }
                                                    >
                                                        {product.stok}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {product.minStok}
                                                </td>
                                                <td className="px-3 py-3 text-right font-medium">
                                                    {rupiah(
                                                        Math.max(
                                                            product.stok,
                                                            0,
                                                        ) * product.hargaBeli,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FlaskConical className="size-5" />
                            Persediaan Non-SKU
                        </CardTitle>
                        <CardDescription>
                            Bahan baku atau olahan yang dinilai secara nominal,
                            bukan per unit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Deskripsi</th>
                                        <th className="px-3 py-2">Transaksi</th>
                                        <th className="px-3 py-2 text-right">
                                            Perubahan Nilai
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nonSku.rows.map((row) => (
                                        <tr
                                            key={`${row.tanggal}-${row.deskripsi}`}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {row.tanggal}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.deskripsi}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.transaksi}
                                            </td>
                                            <td
                                                className={`px-3 py-2 text-right font-medium ${
                                                    row.perubahan < 0
                                                        ? 'text-red-600'
                                                        : ''
                                                }`}
                                            >
                                                {rupiah(row.perubahan)}
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

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
            <Skeleton className="h-64 rounded-md" />
        </div>
    );
}
