import { Head, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
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

type Account = { kode: string; nama: string; current: number };
type FixedAsset = {
    id: number;
    nama: string;
    kategori: string;
    harga: number;
    tanggal: string;
    masa: number;
    akumulasi: number;
};
type Props = {
    defaultDate: string;
    assetAccounts: Account[];
    liabilityAccounts: Account[];
    fixedAssetCategories: string[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

export default function OpeningBalance({
    defaultDate,
    assetAccounts,
    liabilityAccounts,
    fixedAssetCategories,
}: Props) {
    const [assetValues, setAssetValues] = useState<Record<string, number>>({});
    const [liabilityValues, setLiabilityValues] = useState<
        Record<string, number>
    >({});
    const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const preview = useMemo(() => {
        const assets = Object.values(assetValues).reduce(
            (sum, value) => sum + value,
            0,
        );
        const liabilities = Object.values(liabilityValues).reduce(
            (sum, value) => sum + value,
            0,
        );
        const fixedAssetValue = fixedAssets.reduce(
            (sum, asset) => sum + asset.harga,
            0,
        );
        const accumulated = fixedAssets.reduce(
            (sum, asset) => sum + asset.akumulasi,
            0,
        );
        const totalAssets = assets + fixedAssetValue;
        const totalCredits = liabilities + accumulated;
        const modal = totalAssets - totalCredits;

        return { totalAssets, totalCredits, modal };
    }, [assetValues, fixedAssets, liabilityValues]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/setup/saldo-awal', { preserveScroll: true });
    };

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Setup Saldo Awal" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Setup Saldo Awal Akun
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Input saldo migrasi dari pencatatan lama. Sistem
                        menyusun jurnal pembukaan dan menyeimbangkan selisih ke
                        3100 Modal Pemilik.
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
                    <div className="grid gap-6 xl:col-span-2">
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Tanggal Pembukuan
                                </CardTitle>
                                <CardDescription>
                                    Persediaan SKU dan non-SKU diisi dari menu
                                    Inventory, bukan dari form ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="date"
                                    name="tanggal"
                                    defaultValue={defaultDate}
                                    className="max-w-48"
                                    required
                                />
                            </CardContent>
                        </Card>

                        <AccountBalanceCard
                            title="Aset Lancar"
                            description="Isi saldo debit per akun pada tanggal pembukuan."
                            namePrefix="aset"
                            accounts={assetAccounts}
                            values={assetValues}
                            setValues={setAssetValues}
                        />

                        <FixedAssetCard
                            rows={fixedAssets}
                            setRows={setFixedAssets}
                            categories={fixedAssetCategories}
                            defaultDate={defaultDate}
                        />

                        <AccountBalanceCard
                            title="Liabilitas / Hutang"
                            description="Isi saldo kredit per akun pada tanggal pembukuan."
                            namePrefix="liab"
                            accounts={liabilityAccounts}
                            values={liabilityValues}
                            setValues={setLiabilityValues}
                        />
                    </div>

                    <Card className="h-fit border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Preview Jurnal Pembukaan
                            </CardTitle>
                            <CardDescription>
                                Auto-balance ke 3100 Modal Pemilik.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <PreviewRow
                                label="Total Aset (Debit)"
                                value={preview.totalAssets}
                            />
                            <PreviewRow
                                label="Total Liabilitas + Akumulasi Penyusutan"
                                value={preview.totalCredits}
                            />
                            <div className="rounded-md border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Auto-balance Modal Pemilik
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {rupiah(Math.abs(preview.modal))}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {preview.modal >= 0
                                        ? 'Modal Pemilik akan dikredit.'
                                        : 'Liabilitas lebih besar dari aset, defisit modal.'}
                                </p>
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Save className="size-4" />
                                Simpan Saldo Awal
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function AccountBalanceCard({
    title,
    description,
    namePrefix,
    accounts,
    values,
    setValues,
}: {
    title: string;
    description: string;
    namePrefix: string;
    accounts: Account[];
    values: Record<string, number>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                {accounts.map((account) => (
                    <div
                        key={account.kode}
                        className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_180px_160px]"
                    >
                        <div>
                            <div className="font-medium">
                                {account.kode} - {account.nama}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Saldo sekarang: {rupiah(account.current)}
                            </div>
                        </div>
                        <input
                            type="hidden"
                            name={`${namePrefix}_kode[]`}
                            value={account.kode}
                        />
                        <Input
                            name={`${namePrefix}_nilai[]`}
                            type="number"
                            min="0"
                            value={values[account.kode] || ''}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [account.kode]:
                                        Number(event.target.value) || 0,
                                }))
                            }
                            placeholder="0"
                        />
                        <div className="flex items-center justify-end text-sm text-muted-foreground">
                            {rupiah(values[account.kode] || 0)}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function FixedAssetCard({
    rows,
    setRows,
    categories,
    defaultDate,
}: {
    rows: FixedAsset[];
    setRows: React.Dispatch<React.SetStateAction<FixedAsset[]>>;
    categories: string[];
    defaultDate: string;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base">Aset Tetap</CardTitle>
                        <CardDescription>
                            Harga beli menjadi debit aset tetap, akumulasi
                            penyusutan menjadi kredit kontra-aset.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            setRows((current) => [
                                ...current,
                                {
                                    id: Date.now(),
                                    nama: '',
                                    kategori: categories[0] ?? 'Lainnya',
                                    harga: 0,
                                    tanggal: defaultDate,
                                    masa: 48,
                                    akumulasi: 0,
                                },
                            ])
                        }
                    >
                        <Plus className="size-4" />
                        Tambah Aset
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {rows.length === 0 ? (
                        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Belum ada aset tetap saldo awal.
                        </div>
                    ) : (
                        rows.map((row) => (
                            <div
                                key={row.id}
                                className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_140px_150px_150px_100px_150px_40px]"
                            >
                                <Input
                                    name="at_nama[]"
                                    value={row.nama}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          nama: event.target
                                                              .value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    placeholder="Nama aset"
                                />
                                <select
                                    name="at_kat[]"
                                    value={row.kategori}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          kategori:
                                                              event.target
                                                                  .value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    name="at_harga[]"
                                    type="number"
                                    min="0"
                                    value={row.harga || ''}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          harga:
                                                              Number(
                                                                  event.target
                                                                      .value,
                                                              ) || 0,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    placeholder="Harga"
                                />
                                <Input
                                    name="at_tgl[]"
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          tanggal:
                                                              event.target
                                                                  .value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                />
                                <Input
                                    name="at_masa[]"
                                    type="number"
                                    min="1"
                                    value={row.masa}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          masa:
                                                              Number(
                                                                  event.target
                                                                      .value,
                                                              ) || 1,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                />
                                <Input
                                    name="at_akum[]"
                                    type="number"
                                    min="0"
                                    value={row.akumulasi || ''}
                                    onChange={(event) =>
                                        setRows((current) =>
                                            current.map((item) =>
                                                item.id === row.id
                                                    ? {
                                                          ...item,
                                                          akumulasi:
                                                              Number(
                                                                  event.target
                                                                      .value,
                                                              ) || 0,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    placeholder="Akumulasi"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setRows((current) =>
                                            current.filter(
                                                (item) => item.id !== row.id,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function PreviewRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{rupiah(value)}</span>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
                <div className="grid gap-6 xl:col-span-2">
                    <Skeleton className="h-48 rounded-md" />
                    <Skeleton className="h-72 rounded-md" />
                    <Skeleton className="h-72 rounded-md" />
                </div>
                <Skeleton className="h-80 rounded-md" />
            </div>
        </div>
    );
}
