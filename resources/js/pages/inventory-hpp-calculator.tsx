import { Head, useForm } from '@inertiajs/react';
import { Calculator, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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

type SavedProduct = {
    id: number;
    nama: string;
    jenis: string;
    satuan: string;
    hargaJual: number;
    totalHpp: number;
};

type Props = {
    savedProducts: SavedProduct[];
};

type Ingredient = {
    id: number;
    bahan: string;
    harga: number;
    satuanBeli: string;
    frekuensi: number;
    satuanPakai: string;
    takaran: number;
    vendor: string;
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

const emptyIngredient = (): Ingredient => ({
    id: Date.now() + Math.random(),
    bahan: '',
    harga: 0,
    satuanBeli: '',
    frekuensi: 1,
    satuanPakai: '',
    takaran: 1,
    vendor: '',
});

export default function InventoryHppCalculator({ savedProducts }: Props) {
    const [nama, setNama] = useState('Paket Chemical Weekly');
    const [jenis, setJenis] = useState('PAKET');
    const [satuan, setSatuan] = useState('paket');
    const [hargaJual, setHargaJual] = useState(325000);
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        {
            id: 1,
            bahan: 'Kaporit Granular',
            harga: 36000,
            satuanBeli: 'kg',
            frekuensi: 1,
            satuanPakai: 'kg',
            takaran: 3,
            vendor: 'CV Aqua Prima',
        },
        {
            id: 2,
            bahan: 'Soda Ash',
            harga: 18000,
            satuanBeli: 'kg',
            frekuensi: 1,
            satuanPakai: 'kg',
            takaran: 2,
            vendor: 'CV Aqua Prima',
        },
    ]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const totals = useMemo(() => {
        const totalHpp = ingredients.reduce((sum, item) => {
            const hargaPerTakar =
                item.frekuensi > 0 ? item.harga / item.frekuensi : 0;
            return sum + hargaPerTakar * item.takaran;
        }, 0);
        const profit = hargaJual - totalHpp;
        const margin = hargaJual > 0 ? (profit / hargaJual) * 100 : 0;

        return { totalHpp, profit, margin };
    }, [hargaJual, ingredients]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/kalkulator-hpp', { preserveScroll: true });
    };

    const reset = () => {
        setNama('');
        setJenis('FNB_MENU');
        setSatuan('porsi');
        setHargaJual(0);
        setIngredients([emptyIngredient()]);
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Master HPP" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Master HPP" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Master HPP
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Hitung harga pokok produk non-SKU, jasa, paket, atau
                        menu. Total HPP, keuntungan, dan margin dihitung dari
                        daftar bahan.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                    <Card className="h-fit border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Produk Tersimpan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {savedProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                        setNama(product.nama);
                                        setJenis(product.jenis);
                                        setSatuan(product.satuan);
                                        setHargaJual(product.hargaJual);
                                    }}
                                    className="rounded-md border p-3 text-left text-sm transition hover:bg-muted/60"
                                >
                                    <div className="font-medium">
                                        {product.nama}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {product.jenis.replace('_', ' ')} · Jual{' '}
                                        {rupiah(product.hargaJual)} · HPP{' '}
                                        {rupiah(product.totalHpp)}
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <form onSubmit={submit} className="grid gap-6">
                        <Card className="border-border/70">
                            <CardHeader>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Calculator className="size-5" />
                                            Info Produk
                                        </CardTitle>
                                        <CardDescription>
                                            Harga jual dikurangi total HPP untuk
                                            mendapatkan keuntungan per produk.
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={reset}
                                        >
                                            <RotateCcw className="size-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Save className="size-4" />
                                            Simpan
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4 lg:grid-cols-4">
                                <div className="grid gap-2 lg:col-span-2">
                                    <Label>Nama Menu / Produk</Label>
                                    <Input
                                        name="nama"
                                        value={nama}
                                        onChange={(event) =>
                                            setNama(event.target.value)
                                        }
                                        placeholder="contoh: Paket Chemical"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Jenis</Label>
                                    <select
                                        name="jenis"
                                        value={jenis}
                                        onChange={(event) =>
                                            setJenis(event.target.value)
                                        }
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="FNB_MENU">
                                            FNB Menu
                                        </option>
                                        <option value="PAKET">Paket</option>
                                        <option value="JASA">Jasa</option>
                                        <option value="NON_SKU">Non-SKU</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Satuan Jual</Label>
                                    <Input
                                        name="satuan"
                                        value={satuan}
                                        onChange={(event) =>
                                            setSatuan(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Harga Jual</Label>
                                    <Input
                                        name="harga_jual"
                                        type="number"
                                        min="0"
                                        value={hargaJual || ''}
                                        onChange={(event) =>
                                            setHargaJual(
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>
                                <SummaryBadge
                                    label="Total HPP"
                                    value={rupiah(totals.totalHpp)}
                                />
                                <SummaryBadge
                                    label="Keuntungan / Produk"
                                    value={rupiah(totals.profit)}
                                />
                                <SummaryBadge
                                    label="Gross Profit Margin"
                                    value={`${totals.margin.toFixed(1)}%`}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Daftar Bahan
                                        </CardTitle>
                                        <CardDescription>
                                            Harga per takar = harga pembelian
                                            dibagi frekuensi pemakaian. HPP per
                                            produksi = harga per takar dikali
                                            takaran.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIngredients((rows) => [
                                                ...rows,
                                                emptyIngredient(),
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Tambah Bahan
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[1180px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="px-3 py-2">
                                                    Bahan
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Harga pembelian
                                                </th>
                                                <th className="px-3 py-2">
                                                    Satuan beli
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Frekuensi
                                                </th>
                                                <th className="px-3 py-2">
                                                    Satuan pakai
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Takaran
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    HPP / produksi
                                                </th>
                                                <th className="px-3 py-2">
                                                    Vendor
                                                </th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ingredients.map((item) => {
                                                const hpp =
                                                    item.frekuensi > 0
                                                        ? (item.harga /
                                                              item.frekuensi) *
                                                          item.takaran
                                                        : 0;

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={
                                                                    item.bahan
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              bahan: event
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    item.harga ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              harga:
                                                                                                  Number(
                                                                                                      event
                                                                                                          .target
                                                                                                          .value,
                                                                                                  ) ||
                                                                                                  0,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={
                                                                    item.satuanBeli
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              satuanBeli:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    item.frekuensi ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              frekuensi:
                                                                                                  Number(
                                                                                                      event
                                                                                                          .target
                                                                                                          .value,
                                                                                                  ) ||
                                                                                                  0,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={
                                                                    item.satuanPakai
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              satuanPakai:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    item.takaran ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              takaran:
                                                                                                  Number(
                                                                                                      event
                                                                                                          .target
                                                                                                          .value,
                                                                                                  ) ||
                                                                                                  0,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium">
                                                            {rupiah(hpp)}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={
                                                                    item.vendor
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.map(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id ===
                                                                                    item.id
                                                                                        ? {
                                                                                              ...row,
                                                                                              vendor: event
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : row,
                                                                            ),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setIngredients(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.filter(
                                                                                (
                                                                                    row,
                                                                                ) =>
                                                                                    row.id !==
                                                                                    item.id,
                                                                            ),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

function SummaryBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-2 text-xl font-semibold">{value}</div>
            {label === 'Gross Profit Margin' && (
                <Badge variant="outline" className="mt-2">
                    Harga jual − Total HPP
                </Badge>
            )}
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                <Skeleton className="h-96 rounded-md" />
                <div className="grid gap-6">
                    <Skeleton className="h-64 rounded-md" />
                    <Skeleton className="h-96 rounded-md" />
                </div>
            </div>
        </div>
    );
}
