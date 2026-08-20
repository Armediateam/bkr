import { Head, Link, useForm } from '@inertiajs/react';
import {
    Calculator,
    Check,
    FileSpreadsheet,
    Plus,
    Save,
    Store,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Account = {
    kode: string;
    nama: string;
};

type ProductOption = {
    id: number;
    nama: string;
    stok: number;
    hargaBeli: number;
};

type PreviewDay = {
    tanggal: string;
    keterangan: string;
    omzet: number;
    duplicate: boolean;
};

type ProductRow = {
    id: string;
    produkId: string;
    qty: number;
};

type ImportMarketplaceProps = {
    akunKas: Account[];
    produkList: ProductOption[];
    previewDays: PreviewDay[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const emptyProductRow = (): ProductRow => ({
    id: makeId(),
    produkId: '',
    qty: 0,
});

function numberValue(value: string | number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

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
    hint,
}: {
    label: string;
    children: React.ReactNode;
    hint?: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            {hint && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {hint}
                </p>
            )}
        </div>
    );
}

function NativeSelect({
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        >
            {children}
        </select>
    );
}

export default function ImportMarketplace({
    akunKas,
    produkList,
    previewDays,
}: ImportMarketplaceProps) {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [akunKasCode, setAkunKasCode] = useState(akunKas[0]?.kode ?? '');
    const [force, setForce] = useState(false);
    const [days, setDays] = useState(
        previewDays.map((day) => ({
            ...day,
            checked: !day.duplicate,
        })),
    );
    const [productRows, setProductRows] = useState<ProductRow[]>([
        emptyProductRow(),
    ]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const selectedDays = days.filter(
        (day) => day.checked && (!day.duplicate || force),
    );
    const totalOmzet = selectedDays.reduce((sum, day) => sum + day.omzet, 0);
    const hppTotal = productRows.reduce((sum, row) => {
        const product = produkList.find(
            (item) => String(item.id) === row.produkId,
        );
        return sum + row.qty * (product?.hargaBeli ?? 0);
    }, 0);

    const parsedSummary = useMemo(
        () => ({
            platform: 'Shopee / TikTok / Tokopedia',
            periode: `${previewDays[0]?.tanggal ?? '-'} - ${previewDays[previewDays.length - 1]?.tanggal ?? '-'}`,
            hari: previewDays.length,
            total: previewDays.reduce((sum, day) => sum + day.omzet, 0),
        }),
        [previewDays],
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/import-marketplace', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Import Marketplace" />
                <ImportMarketplaceSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Import Marketplace" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Import Penjualan Marketplace
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Upload laporan Excel marketplace, preview omzet harian,
                        lalu posting jurnal penjualan dan HPP opsional.
                    </p>
                </div>

                {step === 'upload' ? (
                    <UploadStep onPreview={() => setStep('preview')} />
                ) : (
                    <form onSubmit={submit} className="grid gap-6">
                        <PreviewSummary summary={parsedSummary} />

                        <Card className="border-border/70">
                            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Store className="size-5" />
                                        Rincian Harian
                                    </CardTitle>
                                    <CardDescription>
                                        Setiap hari yang dicentang akan menjadi
                                        satu jurnal penjualan.
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-end gap-2">
                                    <Field label="Masuk ke akun">
                                        <NativeSelect
                                            value={akunKasCode}
                                            onChange={(event) =>
                                                setAkunKasCode(
                                                    event.target.value,
                                                )
                                            }
                                            name="akun_kas"
                                        >
                                            {akunKas.map((account) => (
                                                <option
                                                    key={account.kode}
                                                    value={account.kode}
                                                >
                                                    {account.kode} -{' '}
                                                    {account.nama}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </Field>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setDays((rows) =>
                                                rows.map((row) => ({
                                                    ...row,
                                                    checked: true,
                                                })),
                                            )
                                        }
                                    >
                                        Centang semua
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setDays((rows) =>
                                                rows.map((row) => ({
                                                    ...row,
                                                    checked: false,
                                                })),
                                            )
                                        }
                                    >
                                        Kosongkan
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="w-12 px-3 py-2"></th>
                                                <th className="px-3 py-2">
                                                    Tanggal
                                                </th>
                                                <th className="px-3 py-2">
                                                    Keterangan
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Omzet
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {days.map((day, index) => (
                                                <tr
                                                    key={`${day.tanggal}-${index}`}
                                                    className="border-t"
                                                >
                                                    <td className="px-3 py-2 text-center">
                                                        <Checkbox
                                                            checked={
                                                                day.checked
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setDays(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                row,
                                                                                rowIndex,
                                                                            ) =>
                                                                                rowIndex ===
                                                                                index
                                                                                    ? {
                                                                                          ...row,
                                                                                          checked:
                                                                                              checked ===
                                                                                              true,
                                                                                      }
                                                                                    : row,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="date"
                                                            value={day.tanggal}
                                                            onChange={(event) =>
                                                                setDays(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                row,
                                                                                rowIndex,
                                                                            ) =>
                                                                                rowIndex ===
                                                                                index
                                                                                    ? {
                                                                                          ...row,
                                                                                          tanggal:
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
                                                            value={
                                                                day.keterangan
                                                            }
                                                            onChange={(event) =>
                                                                setDays(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                row,
                                                                                rowIndex,
                                                                            ) =>
                                                                                rowIndex ===
                                                                                index
                                                                                    ? {
                                                                                          ...row,
                                                                                          keterangan:
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : row,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                        {day.duplicate && (
                                                            <span className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                                sudah diimport
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="text-right"
                                                            value={day.omzet}
                                                            onChange={(event) =>
                                                                setDays(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                row,
                                                                                rowIndex,
                                                                            ) =>
                                                                                rowIndex ===
                                                                                index
                                                                                    ? {
                                                                                          ...row,
                                                                                          omzet: numberValue(
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                          ),
                                                                                      }
                                                                                    : row,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t bg-muted/30 font-semibold">
                                                <td
                                                    colSpan={3}
                                                    className="px-3 py-2 text-right"
                                                >
                                                    Total dipilih
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {rupiah(totalOmzet)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <StockHppSection
                            produkList={produkList}
                            productRows={productRows}
                            setProductRows={setProductRows}
                            hppTotal={hppTotal}
                        />

                        <Card className="border-border/70">
                            <CardContent className="grid gap-4 pt-6">
                                {previewDays.some((day) => day.duplicate) && (
                                    <label className="flex items-start gap-3 text-sm">
                                        <Checkbox
                                            checked={force}
                                            onCheckedChange={(checked) =>
                                                setForce(checked === true)
                                            }
                                        />
                                        <span>
                                            <span className="font-medium">
                                                Paksa import ulang hari yang
                                                sudah pernah dicatat
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Baris duplikat hanya ikut
                                                posting jika opsi ini aktif.
                                            </span>
                                        </span>
                                    </label>
                                )}
                                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    Setiap hari yang dicentang menjadi satu
                                    jurnal: debit akun kas terpilih, kredit 4100
                                    - Pendapatan Penjualan.
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep('upload')}
                                    >
                                        Ulangi / Ganti File
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Check className="size-4" />
                                        Posting {selectedDays.length} Jurnal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </>
    );
}

function UploadStep({ onPreview }: { onPreview: () => void }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileSpreadsheet className="size-5" />
                    Import Penjualan dari Marketplace
                </CardTitle>
                <CardDescription>
                    Upload file .xlsx dari Shopee, TikTok, atau Tokopedia. File
                    hanya dibaca untuk preview dan tidak disimpan.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/70 bg-muted/30">
                        <CardContent className="grid gap-2 pt-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <Store className="size-4" />
                                Cara kerja
                            </div>
                            <p>
                                Shopee, TikTok, dan Tokopedia dikenali dari
                                format laporan Excel dan omzet harian.
                            </p>
                            <p>
                                Pesanan batal/dikembalikan diabaikan sesuai
                                sumber data yang terbaca.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/70 bg-muted/30">
                        <CardContent className="grid gap-2 pt-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <Calculator className="size-4" />
                                Cara perhitungan
                            </div>
                            <p>
                                Tiap tanggal menjadi satu jurnal: debit
                                kas/bank, kredit pendapatan penjualan.
                            </p>
                            <p>
                                Biaya admin marketplace dan HPP dicatat terpisah
                                jika datanya diisi.
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <Field label="File Excel (.xlsx) dari marketplace">
                    <Input type="file" accept=".xlsx" />
                </Field>
                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Batal</Link>
                    </Button>
                    <Button type="button" onClick={onPreview}>
                        <Save className="size-4" />
                        Cek & Preview
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PreviewSummary({
    summary,
}: {
    summary: { platform: string; periode: string; hari: number; total: number };
}) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Summary title="Marketplace" value={summary.platform} />
            <Summary title="Periode" value={summary.periode} />
            <Summary title="Hari Penjualan" value={String(summary.hari)} />
            <Summary title="Total Omzet" value={rupiah(summary.total)} />
        </div>
    );
}

function Summary({ title, value }: { title: string; value: string }) {
    return (
        <Card className="border-border/70">
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function StockHppSection({
    produkList,
    productRows,
    setProductRows,
    hppTotal,
}: {
    produkList: ProductOption[];
    productRows: ProductRow[];
    setProductRows: React.Dispatch<React.SetStateAction<ProductRow[]>>;
    hppTotal: number;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Store className="size-5" />
                        Kurangi Stok / HPP
                    </CardTitle>
                    <CardDescription>
                        Opsional. Isi jika stok produk ikut berkurang dari
                        penjualan marketplace.
                    </CardDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setProductRows((rows) => [...rows, emptyProductRow()])
                    }
                >
                    <Plus className="size-4" />
                    Tambah Produk
                </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Jika diisi, sistem membuat jurnal HPP terpisah: debit 5100
                    HPP, kredit 1130 Persediaan, dan stok produk turun.
                </div>
                <div className="grid gap-3">
                    {productRows.map((row) => {
                        const product = produkList.find(
                            (item) => String(item.id) === row.produkId,
                        );
                        const lineHpp = row.qty * (product?.hargaBeli ?? 0);

                        return (
                            <div
                                key={row.id}
                                className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_160px_140px_44px]"
                            >
                                <NativeSelect
                                    value={row.produkId}
                                    onChange={(event) =>
                                        setProductRows((rows) =>
                                            rows.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          produkId:
                                                              event.target
                                                                  .value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                >
                                    <option value="">Pilih produk...</option>
                                    {produkList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama} (stok {item.stok})
                                        </option>
                                    ))}
                                </NativeSelect>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="qty terjual"
                                    value={row.qty || ''}
                                    onChange={(event) =>
                                        setProductRows((rows) =>
                                            rows.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          qty: numberValue(
                                                              event.target
                                                                  .value,
                                                          ),
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                />
                                <div className="flex items-center justify-end text-sm font-medium">
                                    {rupiah(lineHpp)}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setProductRows((rows) =>
                                            rows.length > 1
                                                ? rows.filter(
                                                      (item) =>
                                                          item.id !== row.id,
                                                  )
                                                : [emptyProductRow()],
                                        )
                                    }
                                >
                                    <Trash2 className="size-4 text-red-600" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-end rounded-md border bg-muted/30 p-3 text-sm">
                    Total HPP:{' '}
                    <span className="ml-2 font-semibold">
                        {rupiah(hppTotal)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function ImportMarketplaceSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-72" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-32 w-full rounded-md" />
                        <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
