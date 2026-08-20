import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    CircleHelp,
    Factory,
    FileText,
    HandCoins,
    Plus,
    Save,
    Scale,
    ShoppingCart,
    Trash2,
    Truck,
    WalletCards,
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

type ProjectOption = {
    id: number;
    kode: string;
    nama: string;
};

type ProductOption = {
    id: number;
    nama: string;
    satuan: string;
    hargaBeli: number;
    stok: number;
};

type ProductRow = {
    id: string;
    produk: string;
    satuan: string;
    qty: number;
    harga: number;
};

type KasRow = {
    id: string;
    akun: string;
    nominal: number;
};

type PembelianProps = {
    today: string;
    akunKas: Account[];
    akunPersediaan: Account[];
    akunAset: Account[];
    proyekAktif: ProjectOption[];
    produkList: ProductOption[];
    vendorList: string[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const emptyProductRow = (): ProductRow => ({
    id: makeId(),
    produk: '',
    satuan: 'pcs',
    qty: 0,
    harga: 0,
});

const emptyKasRow = (akun = ''): KasRow => ({
    id: makeId(),
    akun,
    nominal: 0,
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
    required = false,
}: {
    label: string;
    children: React.ReactNode;
    hint?: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label>
                {label} {required && <span className="text-red-600">*</span>}
            </Label>
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

function MoneyInput(props: React.ComponentProps<typeof Input>) {
    return (
        <div className="flex">
            <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                Rp
            </span>
            <Input
                type="number"
                min="0"
                step="1"
                className="rounded-l-none"
                {...props}
            />
        </div>
    );
}

function SummaryBox({
    title,
    value,
    hint,
    tone = 'default',
}: {
    title: string;
    value: string;
    hint: string;
    tone?: 'default' | 'blue' | 'red' | 'green' | 'amber';
}) {
    const toneClass = {
        default: 'text-foreground',
        blue: 'text-sky-600',
        red: 'text-red-600',
        green: 'text-emerald-600',
        amber: 'text-amber-600',
    }[tone];

    return (
        <div className="min-w-0 border-r border-border px-3 py-3 text-center last:border-r-0 max-md:border-b">
            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {title}
            </div>
            <div className={`mt-1 truncate text-base font-bold ${toneClass}`}>
                {value}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
        </div>
    );
}

export default function Pembelian({
    today,
    akunKas,
    akunPersediaan,
    akunAset,
    proyekAktif,
    produkList,
    vendorList,
}: PembelianProps) {
    const [kategori, setKategori] = useState<'BAHAN_BAKU' | 'INVESTASI_ASET'>(
        'BAHAN_BAKU',
    );
    const [multiKas, setMultiKas] = useState(false);
    const [kasRows, setKasRows] = useState<KasRow[]>([
        emptyKasRow(akunKas[0]?.kode ?? ''),
    ]);
    const [vendor, setVendor] = useState('');
    const [nominal, setNominal] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);
    const [productRows, setProductRows] = useState<ProductRow[]>([
        emptyProductRow(),
    ]);
    const [nonSkuDeskripsi, setNonSkuDeskripsi] = useState('');
    const [nonSkuNilai, setNonSkuNilai] = useState(0);
    const [pajakAktif, setPajakAktif] = useState(false);
    const [ppnPct, setPpnPct] = useState(11);
    const [pph23Pct, setPph23Pct] = useState(0);
    const [masaPakai, setMasaPakai] = useState(36);
    const [showHelp, setShowHelp] = useState(false);
    const [processing, setProcessing] = useState(false);
    const showSkeleton = usePageSkeleton();

    const produkTotal = useMemo(
        () => productRows.reduce((sum, row) => sum + row.qty * row.harga, 0),
        [productRows],
    );
    const totalValuasi = produkTotal + nonSkuNilai;
    const effectiveNominal =
        kategori === 'BAHAN_BAKU' && totalValuasi > 0 ? totalValuasi : nominal;
    const ppn = pajakAktif ? effectiveNominal * (ppnPct / 100) : 0;
    const pph23 = pajakAktif ? effectiveNominal * (pph23Pct / 100) : 0;
    const totalDibayarTerhutang = Math.max(effectiveNominal + ppn - pph23, 0);
    const effectiveKeluar = uangKeluar || totalDibayarTerhutang;
    const hutang = Math.max(totalDibayarTerhutang - effectiveKeluar, 0);
    const penyusutan =
        kategori === 'INVESTASI_ASET'
            ? effectiveNominal / Math.max(masaPakai, 1)
            : 0;
    const multiKasTotal = kasRows.reduce((sum, row) => sum + row.nominal, 0);

    const updateProductRow = (id: string, patch: Partial<ProductRow>) => {
        setProductRows((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    };

    const updateKasRow = (id: string, patch: Partial<KasRow>) => {
        setKasRows((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    };

    const chooseProduct = (id: string, productName: string) => {
        const product = produkList.find((item) => item.nama === productName);
        if (!product) {
            updateProductRow(id, { produk: productName });
            return;
        }

        updateProductRow(id, {
            produk: product.nama,
            satuan: product.satuan,
            harga: product.hargaBeli,
        });
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set('kategori', kategori);
        formData.set('ppn_pct', String(pajakAktif ? ppnPct : 0));
        formData.set('pph23_pct', String(pajakAktif ? pph23Pct : 0));

        router.post('/dashboard/pembelian', formData, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Input Pembelian" />
                <PembelianSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Input Pembelian" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Input Pembelian
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Catat pembelian stok/bahan baku, aset tetap, multi
                            rekening, hutang, pajak, dan preview jurnal
                            otomatis.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowHelp((value) => !value)}
                    >
                        <CircleHelp className="size-4" />
                        Panduan
                    </Button>
                </div>

                {showHelp && (
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Panduan Pembelian
                            </CardTitle>
                            <CardDescription>
                                Ringkasan perlakuan stok dan aset tetap saat
                                dicatat dari halaman ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm text-muted-foreground">
                            <p>
                                <strong>Bahan Baku / Stok</strong> menambah
                                persediaan di neraca. Biaya baru menjadi HPP
                                saat barang terjual.
                            </p>
                            <p>
                                <strong>Aset Tetap</strong> menambah aset dan
                                dihitung sebagai penyusutan bulanan selama masa
                                pakai.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="size-5" />
                                Input Pembelian
                            </CardTitle>
                            <CardDescription>
                                Catat pembelian stok, aset, rekening, pajak,
                                hutang, dan jurnal dalam satu form.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <section className="grid gap-3">
                                <Field label="Jenis Pembelian" required>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setKategori('BAHAN_BAKU')
                                            }
                                            className={`flex min-w-40 items-center gap-2 rounded-md border p-3 text-sm font-semibold ${kategori === 'BAHAN_BAKU' ? 'border-primary bg-primary/10 text-primary' : 'bg-background'}`}
                                        >
                                            <Factory className="size-4" />
                                            Bahan Baku / Stok
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setKategori('INVESTASI_ASET')
                                            }
                                            className={`flex min-w-40 items-center gap-2 rounded-md border p-3 text-sm font-semibold ${kategori === 'INVESTASI_ASET' ? 'border-primary bg-primary/10 text-primary' : 'bg-background'}`}
                                        >
                                            <Building2 className="size-4" />
                                            Aset Tetap
                                        </button>
                                    </div>
                                </Field>
                                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                    {kategori === 'BAHAN_BAKU'
                                        ? 'Stok / bahan baku menambah persediaan. Bisa bayar tunai sekarang atau hutang dulu ke pemasok.'
                                        : 'Investasi aset tidak langsung jadi beban. Nilainya dibagi selama masa pakai sebagai penyusutan.'}
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        max={today}
                                        required
                                    />
                                </Field>
                                {!multiKas && (
                                    <Field label="Keluar dari Rekening">
                                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                            <NativeSelect name="akun_kas">
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
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setMultiKas(true)
                                                }
                                            >
                                                <WalletCards className="size-4" />
                                                Multi Rekening
                                            </Button>
                                        </div>
                                    </Field>
                                )}
                            </section>

                            {multiKas && (
                                <section className="grid gap-3 rounded-md border p-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <WalletCards className="size-4 text-red-600" />
                                            Keluar dari Rekening
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                MULTI
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMultiKas(false)}
                                        >
                                            Single Rekening
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto rounded-md border">
                                        <table className="w-full min-w-[620px] text-sm">
                                            <thead className="bg-muted/60">
                                                <tr className="text-left">
                                                    <th className="px-3 py-2">
                                                        Rekening
                                                    </th>
                                                    <th className="w-56 px-3 py-2">
                                                        Nominal
                                                    </th>
                                                    <th className="w-12 px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kasRows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            <NativeSelect
                                                                value={row.akun}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateKasRow(
                                                                        row.id,
                                                                        {
                                                                            akun: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {akunKas.map(
                                                                    (
                                                                        account,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                account.kode
                                                                            }
                                                                            value={
                                                                                account.kode
                                                                            }
                                                                        >
                                                                            {
                                                                                account.kode
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                account.nama
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </NativeSelect>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <MoneyInput
                                                                value={
                                                                    row.nominal
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateKasRow(
                                                                        row.id,
                                                                        {
                                                                            nominal:
                                                                                numberValue(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setKasRows(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.length ===
                                                                            1
                                                                                ? [
                                                                                      emptyKasRow(
                                                                                          akunKas[0]
                                                                                              ?.kode ??
                                                                                              '',
                                                                                      ),
                                                                                  ]
                                                                                : rows.filter(
                                                                                      (
                                                                                          item,
                                                                                      ) =>
                                                                                          item.id !==
                                                                                          row.id,
                                                                                  ),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4 text-red-600" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setKasRows((rows) => [
                                                    ...rows,
                                                    emptyKasRow(
                                                        akunKas[0]?.kode ?? '',
                                                    ),
                                                ])
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Tambah Rekening
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Total:{' '}
                                            <strong className="text-sky-600">
                                                {rupiah(multiKasTotal)}
                                            </strong>{' '}
                                            / Uang Keluar:{' '}
                                            <strong>
                                                {rupiah(effectiveKeluar)}
                                            </strong>
                                        </span>
                                        {multiKasTotal > effectiveKeluar && (
                                            <span className="text-sm text-red-600">
                                                Total rekening melebihi uang
                                                keluar.
                                            </span>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className="grid gap-4 md:grid-cols-2">
                                {kategori === 'BAHAN_BAKU' && (
                                    <Field
                                        label="Akun Persediaan (COA)"
                                        hint="Default: 1130 Persediaan Barang."
                                    >
                                        <NativeSelect name="akun_persediaan_kode">
                                            <option value="">
                                                -- Default (1130 Persediaan
                                                Barang) --
                                            </option>
                                            {akunPersediaan.map((account) => (
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
                                )}
                                <Field label="Vendor / Pemasok" hint="Opsional">
                                    <Input
                                        list="vendor-list"
                                        value={vendor}
                                        onChange={(event) =>
                                            setVendor(event.target.value)
                                        }
                                        name="vendor"
                                        placeholder="Cari / ketik nama vendor"
                                    />
                                    <datalist id="vendor-list">
                                        {vendorList.map((name) => (
                                            <option key={name} value={name} />
                                        ))}
                                    </datalist>
                                    <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Checkbox
                                            name="simpan_vendor"
                                            value="1"
                                        />
                                        <Truck className="size-3.5 text-sky-600" />
                                        Simpan ke database vendor
                                    </label>
                                </Field>
                                <Field label="Keterangan">
                                    <Input
                                        name="keterangan"
                                        placeholder="Keterangan pengeluaran..."
                                    />
                                </Field>
                                <Field
                                    label="Proyek"
                                    hint="Biaya akan dihitung ke laba rugi proyek ini."
                                >
                                    <NativeSelect name="proyek_id">
                                        <option value="">
                                            -- Tanpa proyek --
                                        </option>
                                        {proyekAktif.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.kode} · {project.nama}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                                <Field label="No. Invoice Supplier">
                                    <Input
                                        name="no_invoice_supplier"
                                        maxLength={60}
                                        placeholder="Nomor nota / invoice dari supplier"
                                    />
                                </Field>
                                <Field
                                    label="No. Faktur Pajak"
                                    hint="Catatan referensi saja, tidak mengubah jurnal."
                                >
                                    <Input
                                        name="no_faktur_pajak"
                                        maxLength={60}
                                        placeholder="Nomor seri faktur pajak, jika ada"
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <Field
                                    label="Nominal Invoice (Total Pengeluaran)"
                                    required
                                >
                                    <MoneyInput
                                        name="nominal"
                                        value={effectiveNominal}
                                        onChange={(event) =>
                                            setNominal(
                                                numberValue(event.target.value),
                                            )
                                        }
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Uang Keluar (Dibayar Sekarang)"
                                    hint="Biarkan 0 untuk full cash otomatis, atau isi sebagian untuk mencatat hutang."
                                >
                                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                        <MoneyInput
                                            name="uang_keluar"
                                            value={uangKeluar}
                                            onChange={(event) =>
                                                setUangKeluar(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setUangKeluar(
                                                    totalDibayarTerhutang,
                                                )
                                            }
                                        >
                                            Full Cash
                                        </Button>
                                    </div>
                                </Field>
                                <Field
                                    label="Hutang"
                                    hint="= Nominal + PPN - PPh - Uang Keluar"
                                >
                                    <div className="rounded-md border bg-muted px-3 py-2 text-sm font-semibold text-amber-600">
                                        {rupiah(hutang)}
                                    </div>
                                </Field>
                            </section>

                            {kategori === 'INVESTASI_ASET' && (
                                <section className="grid gap-4 rounded-md border p-3 md:grid-cols-2">
                                    <Field label="Nama Aset" required>
                                        <Input
                                            name="nama_aset"
                                            placeholder="Misal: Laptop Dell XPS"
                                        />
                                    </Field>
                                    <Field label="Kategori Aset">
                                        <NativeSelect name="kategori_aset">
                                            <option value="Peralatan">
                                                Peralatan
                                            </option>
                                            <option value="Kendaraan">
                                                Kendaraan
                                            </option>
                                            <option value="Gedung">
                                                Gedung & Bangunan
                                            </option>
                                        </NativeSelect>
                                    </Field>
                                    <Field
                                        label="Akun Aset Tetap (COA)"
                                        hint="Default mengikuti kategori aset."
                                    >
                                        <NativeSelect name="akun_aset_kode">
                                            <option value="">
                                                -- Default (sesuai kategori
                                                aset) --
                                            </option>
                                            {akunAset.map((account) => (
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
                                    <Field label="Masa Pakai">
                                        <div className="flex">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={masaPakai}
                                                onChange={(event) =>
                                                    setMasaPakai(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                className="rounded-r-none"
                                            />
                                            <span className="inline-flex h-9 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                                bulan
                                            </span>
                                        </div>
                                    </Field>
                                    <Field label="Penyusutan per Bulan (Auto)">
                                        <div className="rounded-md border bg-muted px-3 py-2 text-sm font-semibold">
                                            {rupiah(penyusutan)}
                                        </div>
                                    </Field>
                                </section>
                            )}

                            {hutang > 0 && (
                                <section className="rounded-md border p-3">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                        <HandCoins className="size-4" />
                                        Detail Hutang
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Field label="Pemasok / Kreditur">
                                            <Input
                                                name="pemasok"
                                                defaultValue={vendor}
                                                placeholder="Nama pemasok / kreditur"
                                            />
                                        </Field>
                                        <Field label="Jatuh Tempo">
                                            <Input
                                                type="date"
                                                name="jatuh_tempo"
                                            />
                                        </Field>
                                    </div>
                                </section>
                            )}

                            {kategori === 'BAHAN_BAKU' && (
                                <section className="grid gap-3 rounded-md border bg-muted/40 p-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Factory className="size-4" />
                                            Catat Produk
                                            <span className="text-xs font-normal text-muted-foreground">
                                                (opsional, bisa campur produk
                                                lama & baru)
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Pilih produk yang sudah ada, atau
                                            ketik nama produk baru. Total
                                            valuasi otomatis menjadi nominal
                                            invoice.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto rounded-md border bg-background">
                                        <table className="w-full min-w-[820px] text-sm">
                                            <thead className="bg-muted/60">
                                                <tr className="text-left">
                                                    <th className="px-3 py-2">
                                                        Produk
                                                    </th>
                                                    <th className="w-28 px-3 py-2">
                                                        Satuan
                                                    </th>
                                                    <th className="w-28 px-3 py-2">
                                                        Qty
                                                    </th>
                                                    <th className="w-52 px-3 py-2">
                                                        Harga Beli/unit
                                                    </th>
                                                    <th className="w-40 px-3 py-2 text-right">
                                                        Subtotal
                                                    </th>
                                                    <th className="w-12 px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productRows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                name="item_nama[]"
                                                                list="produk-beli-list"
                                                                value={
                                                                    row.produk
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    chooseProduct(
                                                                        row.id,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Cari / ketik produk baru"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                name="satuan[]"
                                                                value={
                                                                    row.satuan
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateProductRow(
                                                                        row.id,
                                                                        {
                                                                            satuan: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                name="qty[]"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={row.qty}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateProductRow(
                                                                        row.id,
                                                                        {
                                                                            qty: numberValue(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <MoneyInput
                                                                name="harga_beli[]"
                                                                value={
                                                                    row.harga
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateProductRow(
                                                                        row.id,
                                                                        {
                                                                            harga: numberValue(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold">
                                                            {rupiah(
                                                                row.qty *
                                                                    row.harga,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setProductRows(
                                                                        (
                                                                            rows,
                                                                        ) =>
                                                                            rows.length ===
                                                                            1
                                                                                ? [
                                                                                      emptyProductRow(),
                                                                                  ]
                                                                                : rows.filter(
                                                                                      (
                                                                                          item,
                                                                                      ) =>
                                                                                          item.id !==
                                                                                          row.id,
                                                                                  ),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4 text-red-600" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <datalist id="produk-beli-list">
                                        {produkList.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.nama}
                                            >
                                                {product.satuan} · stok{' '}
                                                {product.stok}
                                            </option>
                                        ))}
                                    </datalist>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setProductRows((rows) => [
                                                    ...rows,
                                                    emptyProductRow(),
                                                ])
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Tambah Produk
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Total Valuasi:{' '}
                                            <strong className="text-sky-600">
                                                {rupiah(totalValuasi)}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="grid gap-3 rounded-md border border-dashed bg-background p-3 md:grid-cols-[1.3fr_0.7fr]">
                                        <Field label="Persediaan Non-SKU">
                                            <Input
                                                value={nonSkuDeskripsi}
                                                onChange={(event) =>
                                                    setNonSkuDeskripsi(
                                                        event.target.value,
                                                    )
                                                }
                                                name="non_sku_deskripsi"
                                                placeholder="Misal: bahan baku produksi umum / bahan olahan"
                                            />
                                        </Field>
                                        <Field label="Nilai Non-SKU">
                                            <MoneyInput
                                                name="non_sku_nilai"
                                                value={nonSkuNilai}
                                                onChange={(event) =>
                                                    setNonSkuNilai(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </section>
                            )}

                            <section className="rounded-md border bg-muted/30 p-3">
                                <label className="flex items-start gap-3 text-sm font-semibold">
                                    <Checkbox
                                        checked={pajakAktif}
                                        onCheckedChange={(value) =>
                                            setPajakAktif(Boolean(value))
                                        }
                                    />
                                    <span>
                                        Tambahkan Fitur Pajak (PPN Masukan / PPh
                                        23 Pemotongan)
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            Aktifkan kalau pembelian ada PPN
                                            Masukan dari supplier PKP, atau kita
                                            memotong PPh 23 dari supplier.
                                        </span>
                                    </span>
                                </label>
                                {pajakAktif && (
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <Field label="Tarif PPN Masukan (%)">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={ppnPct}
                                                onChange={(event) =>
                                                    setPpnPct(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Potong PPh 23 ke Supplier (%)">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={pph23Pct}
                                                onChange={(event) =>
                                                    setPph23Pct(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                        <div className="overflow-hidden rounded-md border bg-background md:col-span-2">
                                            <div className="grid md:grid-cols-4">
                                                <SummaryBox
                                                    title="DPP"
                                                    value={rupiah(
                                                        effectiveNominal,
                                                    )}
                                                    hint="nominal"
                                                />
                                                <SummaryBox
                                                    title="+ PPN Masukan"
                                                    value={rupiah(ppn)}
                                                    hint="bisa dikreditkan"
                                                    tone="blue"
                                                />
                                                <SummaryBox
                                                    title="- PPh 23"
                                                    value={rupiah(pph23)}
                                                    hint="hutang pajak"
                                                    tone="red"
                                                />
                                                <SummaryBox
                                                    title="Dibayar / Terhutang"
                                                    value={rupiah(
                                                        totalDibayarTerhutang,
                                                    )}
                                                    hint="setelah pajak"
                                                    tone="amber"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="grid gap-3 rounded-md border p-3">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                                    <Scale className="size-4" />
                                    Preview Jurnal Otomatis
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[640px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="px-3 py-2">
                                                    Akun
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Debit
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Kredit
                                                </th>
                                                <th className="px-3 py-2">
                                                    Dampak
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <JournalRow
                                                account={
                                                    kategori === 'BAHAN_BAKU'
                                                        ? 'Persediaan Barang (1130)'
                                                        : 'Aset Tetap'
                                                }
                                                debit={effectiveNominal}
                                                credit={0}
                                                impact={
                                                    kategori === 'BAHAN_BAKU'
                                                        ? 'Persediaan bertambah'
                                                        : 'Aset tetap bertambah'
                                                }
                                            />
                                            {ppn > 0 && (
                                                <JournalRow
                                                    account="PPN Masukan"
                                                    debit={ppn}
                                                    credit={0}
                                                    impact="Aset pajak masukan"
                                                />
                                            )}
                                            {effectiveKeluar > 0 && (
                                                <JournalRow
                                                    account="Kas / Bank"
                                                    debit={0}
                                                    credit={effectiveKeluar}
                                                    impact="Uang keluar sekarang"
                                                />
                                            )}
                                            {hutang > 0 && (
                                                <JournalRow
                                                    account="Hutang Usaha"
                                                    debit={0}
                                                    credit={hutang}
                                                    impact="Sisa belum dibayar"
                                                />
                                            )}
                                            {pph23 > 0 && (
                                                <JournalRow
                                                    account="Hutang PPh 23"
                                                    debit={0}
                                                    credit={pph23}
                                                    impact="Pajak dipotong dari supplier"
                                                />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Simpan Pembelian
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function PembelianSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <Card>
                <CardHeader className="border-b">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <Skeleton className="h-24 w-full rounded-md" />
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="grid gap-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-20 w-full rounded-md"
                            />
                        ))}
                    </div>
                    <div className="overflow-hidden rounded-md border">
                        <Skeleton className="h-11 w-full rounded-none" />
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-14 w-full rounded-none border-t"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-32 w-full rounded-md" />
                    <Skeleton className="h-40 w-full rounded-md" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function JournalRow({
    account,
    debit,
    credit,
    impact,
}: {
    account: string;
    debit: number;
    credit: number;
    impact: string;
}) {
    return (
        <tr className="border-t">
            <td className="px-3 py-2 font-medium">{account}</td>
            <td className="px-3 py-2 text-right">
                {debit > 0 ? rupiah(debit) : '-'}
            </td>
            <td className="px-3 py-2 text-right">
                {credit > 0 ? rupiah(credit) : '-'}
            </td>
            <td className="px-3 py-2 text-muted-foreground">{impact}</td>
        </tr>
    );
}
