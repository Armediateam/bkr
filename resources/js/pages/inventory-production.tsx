import { Head, useForm } from '@inertiajs/react';
import { Calculator, Factory, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
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

type Product = {
    id: number;
    nama: string;
    satuan: string;
    hpp: number;
    stok: number;
};

type CashAccount = {
    kode: string;
    nama: string;
};

type History = {
    id: number;
    tanggal: string;
    produk: string;
    qty: number;
    satuan: string;
    bahan: string;
    totalHpp: number;
    hppUnit: number;
};

type Props = {
    today: string;
    products: Product[];
    cashAccounts: CashAccount[];
    history: History[];
};

type SkuRow = {
    id: number;
    productId: number;
    qty: number;
};

type NonSkuRow = {
    id: number;
    deskripsi: string;
    qty: number;
    satuan: string;
    nilai: number;
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
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

export default function InventoryProduction({
    today,
    products,
    cashAccounts,
    history,
}: Props) {
    const [mode, setMode] = useState<'existing' | 'new'>('existing');
    const [finishedProductId, setFinishedProductId] = useState(
        products[0]?.id ?? 0,
    );
    const [qtyHasil, setQtyHasil] = useState(1);
    const [biayaTambahan, setBiayaTambahan] = useState(0);
    const [skuRows, setSkuRows] = useState<SkuRow[]>([
        { id: 1, productId: products[1]?.id ?? products[0]?.id ?? 0, qty: 1 },
    ]);
    const [nonSkuRows, setNonSkuRows] = useState<NonSkuRow[]>([
        { id: 1, deskripsi: 'Bahan umum', qty: 1, satuan: 'paket', nilai: 0 },
    ]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const totals = useMemo(() => {
        const sku = skuRows.reduce((sum, row) => {
            const product = products.find((item) => item.id === row.productId);
            return sum + (product?.hpp ?? 0) * row.qty;
        }, 0);
        const nonSku = nonSkuRows.reduce((sum, row) => sum + row.nilai, 0);
        const total = sku + nonSku + biayaTambahan;

        return {
            sku,
            nonSku,
            totalBahan: sku + nonSku,
            biayaTambahan,
            total,
            hppUnit: qtyHasil > 0 ? total / qtyHasil : 0,
        };
    }, [biayaTambahan, nonSkuRows, products, qtyHasil, skuRows]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/produksi', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Produksi" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Produksi" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Produksi Sederhana
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Ubah bahan SKU dan non-SKU menjadi barang jadi. Nilai
                        bahan otomatis menjadi HPP produk jadi.
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
                    <div className="grid gap-6 xl:col-span-2">
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Factory className="size-5" />
                                    Barang Jadi
                                </CardTitle>
                                <CardDescription>
                                    Pilih produk jadi yang ada atau siapkan nama
                                    produk baru untuk didaftarkan ke inventory.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        required
                                    />
                                </Field>
                                <Field label="Jumlah Hasil" required>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={qtyHasil || ''}
                                        onChange={(event) =>
                                            setQtyHasil(
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                        required
                                    />
                                </Field>
                                <div className="md:col-span-2">
                                    <div className="mb-2 flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                mode === 'existing'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() => setMode('existing')}
                                        >
                                            Pilih yang ada
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                mode === 'new'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() => setMode('new')}
                                        >
                                            Buat baru
                                        </Button>
                                    </div>
                                    {mode === 'existing' ? (
                                        <select
                                            name="produk_jadi_id"
                                            value={finishedProductId}
                                            onChange={(event) =>
                                                setFinishedProductId(
                                                    Number(event.target.value),
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.nama} · stok{' '}
                                                    {product.stok}{' '}
                                                    {product.satuan}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <Input
                                                name="produk_jadi_nama"
                                                placeholder="Nama produk baru"
                                            />
                                            <Input
                                                name="produk_jadi_satuan"
                                                placeholder="Satuan"
                                                defaultValue="paket"
                                            />
                                            <Input
                                                name="produk_jadi_harga_jual"
                                                type="number"
                                                placeholder="Harga jual"
                                            />
                                        </div>
                                    )}
                                </div>
                                <Field label="Keterangan">
                                    <Input
                                        name="keterangan"
                                        placeholder="Mis: produksi batch pagi"
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Bahan Baku SKU
                                        </CardTitle>
                                        <CardDescription>
                                            HPP/unit memakai harga beli
                                            rata-rata produk.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setSkuRows((rows) => [
                                                ...rows,
                                                {
                                                    id: Date.now(),
                                                    productId:
                                                        products[0]?.id ?? 0,
                                                    qty: 0,
                                                },
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {skuRows.map((row) => {
                                        const product = products.find(
                                            (item) => item.id === row.productId,
                                        );

                                        return (
                                            <div
                                                key={row.id}
                                                className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_140px_140px_40px]"
                                            >
                                                <select
                                                    name="bahan_id[]"
                                                    value={row.productId}
                                                    onChange={(event) =>
                                                        setSkuRows((rows) =>
                                                            rows.map((item) =>
                                                                item.id ===
                                                                row.id
                                                                    ? {
                                                                          ...item,
                                                                          productId:
                                                                              Number(
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                              ),
                                                                      }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    {products.map((item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Input
                                                    name="bahan_qty[]"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.qty || ''}
                                                    onChange={(event) =>
                                                        setSkuRows((rows) =>
                                                            rows.map((item) =>
                                                                item.id ===
                                                                row.id
                                                                    ? {
                                                                          ...item,
                                                                          qty:
                                                                              Number(
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                              ) ||
                                                                              0,
                                                                      }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="Qty"
                                                />
                                                <div className="flex h-9 items-center justify-end rounded-md border bg-muted/30 px-3 text-sm">
                                                    {rupiah(product?.hpp ?? 0)}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setSkuRows((rows) =>
                                                            rows.filter(
                                                                (item) =>
                                                                    item.id !==
                                                                    row.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Bahan Non-SKU / Bahan Umum
                                        </CardTitle>
                                        <CardDescription>
                                            Nilai ini mengurangi persediaan
                                            non-SKU dan ikut menjadi HPP.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setNonSkuRows((rows) => [
                                                ...rows,
                                                {
                                                    id: Date.now(),
                                                    deskripsi: '',
                                                    qty: 0,
                                                    satuan: '',
                                                    nilai: 0,
                                                },
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {nonSkuRows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_90px_110px_140px_40px]"
                                    >
                                        <Input
                                            name="non_sku_deskripsi[]"
                                            value={row.deskripsi}
                                            onChange={(event) =>
                                                setNonSkuRows((rows) =>
                                                    rows.map((item) =>
                                                        item.id === row.id
                                                            ? {
                                                                  ...item,
                                                                  deskripsi:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="Mis: bahan campuran"
                                        />
                                        <Input
                                            name="non_sku_qty[]"
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={row.qty || ''}
                                            onChange={(event) =>
                                                setNonSkuRows((rows) =>
                                                    rows.map((item) =>
                                                        item.id === row.id
                                                            ? {
                                                                  ...item,
                                                                  qty:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="Qty"
                                        />
                                        <Input
                                            name="non_sku_satuan[]"
                                            value={row.satuan}
                                            onChange={(event) =>
                                                setNonSkuRows((rows) =>
                                                    rows.map((item) =>
                                                        item.id === row.id
                                                            ? {
                                                                  ...item,
                                                                  satuan: event
                                                                      .target
                                                                      .value,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="kg/liter"
                                        />
                                        <Input
                                            name="non_sku_nilai[]"
                                            type="number"
                                            min="0"
                                            value={row.nilai || ''}
                                            onChange={(event) =>
                                                setNonSkuRows((rows) =>
                                                    rows.map((item) =>
                                                        item.id === row.id
                                                            ? {
                                                                  ...item,
                                                                  nilai:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="Nilai"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setNonSkuRows((rows) =>
                                                    rows.filter(
                                                        (item) =>
                                                            item.id !== row.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid h-fit gap-6">
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calculator className="size-5" />
                                    Ringkasan Produksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <SummaryRow
                                    label="Total Nilai Bahan"
                                    value={rupiah(totals.totalBahan)}
                                />
                                <SummaryRow
                                    label="SKU"
                                    value={rupiah(totals.sku)}
                                />
                                <SummaryRow
                                    label="Non-SKU"
                                    value={rupiah(totals.nonSku)}
                                />
                                <Field label="Biaya Tambahan">
                                    <Input
                                        name="biaya_tambahan"
                                        type="number"
                                        min="0"
                                        value={biayaTambahan || ''}
                                        onChange={(event) =>
                                            setBiayaTambahan(
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Dibayar dari">
                                    <select
                                        name="akun_kas"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {cashAccounts.map((account) => (
                                            <option
                                                key={account.kode}
                                                value={account.kode}
                                            >
                                                {account.kode} · {account.nama}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <SummaryRow
                                        label="Total HPP Produksi"
                                        value={rupiah(totals.total)}
                                    />
                                    <SummaryRow
                                        label="HPP per Unit"
                                        value={rupiah(totals.hppUnit)}
                                    />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Simpan Produksi
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Riwayat Produksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">
                                            Produk Jadi
                                        </th>
                                        <th className="px-3 py-2">Qty</th>
                                        <th className="px-3 py-2">
                                            Bahan Dipakai
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Total HPP
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            HPP/unit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((row) => (
                                        <tr key={row.id} className="border-t">
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {row.tanggal}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {row.produk}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.qty} {row.satuan}
                                            </td>
                                            <td className="px-3 py-2">
                                                {row.bahan}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {rupiah(row.totalHpp)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                {rupiah(row.hppUnit)}
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

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
                <div className="grid gap-6 xl:col-span-2">
                    <Skeleton className="h-56 rounded-md" />
                    <Skeleton className="h-72 rounded-md" />
                    <Skeleton className="h-64 rounded-md" />
                </div>
                <Skeleton className="h-96 rounded-md" />
            </div>
            <Skeleton className="h-72 rounded-md" />
        </div>
    );
}
