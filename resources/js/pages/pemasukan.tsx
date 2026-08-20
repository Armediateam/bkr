import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    CircleHelp,
    Copy,
    FileText,
    HandCoins,
    List,
    Plus,
    ReceiptText,
    Save,
    Scale,
    SlidersHorizontal,
    Trash2,
    TrendingUp,
    UserPlus,
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
    harga: number;
    hpp: number;
    stok: number;
};

type SalesItem = {
    id: string;
    item: string;
    qty: number;
    harga: number;
    hpp: number;
    diskon: number;
};

type ProductItem = SalesItem & {
    satuan: string;
};

type PemasukanProps = {
    today: string;
    saldoPersediaan: number;
    akunKas: Account[];
    akunPendapatan: Account[];
    proyekAktif: ProjectOption[];
    produkList: ProductOption[];
    customerList: string[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const emptySalesItem = (): SalesItem => ({
    id: makeId(),
    item: '',
    qty: 1,
    harga: 0,
    hpp: 0,
    diskon: 0,
});

const emptyProductItem = (): ProductItem => ({
    ...emptySalesItem(),
    satuan: '',
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

function subtotal(row: SalesItem): number {
    return Math.max(row.qty * row.harga - row.diskon, 0);
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

export default function Pemasukan({
    today,
    saldoPersediaan,
    akunKas,
    akunPendapatan,
    proyekAktif,
    produkList,
    customerList,
}: PemasukanProps) {
    const [items, setItems] = useState<SalesItem[]>([emptySalesItem()]);
    const [productItems, setProductItems] = useState<ProductItem[]>([
        emptyProductItem(),
    ]);
    const [uangMasuk, setUangMasuk] = useState(0);
    const [diskon, setDiskon] = useState(0);
    const [ongkir, setOngkir] = useState(0);
    const [biaya, setBiaya] = useState(0);
    const [biayaMarketplace, setBiayaMarketplace] = useState(0);
    const [pajakAktif, setPajakAktif] = useState(false);
    const [ppnPct, setPpnPct] = useState(11);
    const [pph22Pct, setPph22Pct] = useState(0);
    const [pph23Pct, setPph23Pct] = useState(0);
    const [buatInvoice, setBuatInvoice] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showLegacyProduk, setShowLegacyProduk] = useState(false);
    const [legacyJasa, setLegacyJasa] = useState(false);
    const [legacyPajak, setLegacyPajak] = useState(false);
    const [legacyJasaValue, setLegacyJasaValue] = useState(0);
    const [legacyOngkir, setLegacyOngkir] = useState(0);
    const [legacyBiaya, setLegacyBiaya] = useState(0);
    const [legacyMasuk, setLegacyMasuk] = useState(0);
    const [pelanggan, setPelanggan] = useState('');
    const [invoicePelanggan, setInvoicePelanggan] = useState('');

    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const itemTotal = useMemo(
        () => items.reduce((sum, row) => sum + subtotal(row), 0),
        [items],
    );
    const hppTotal = useMemo(
        () => items.reduce((sum, row) => sum + row.qty * row.hpp, 0),
        [items],
    );
    const totalBersih = Math.max(itemTotal - diskon + ongkir + biaya, 0);
    const ppn = pajakAktif ? totalBersih * (ppnPct / 100) : 0;
    const pph22 = pajakAktif ? totalBersih * (pph22Pct / 100) : 0;
    const pph23 = pajakAktif ? totalBersih * (pph23Pct / 100) : 0;
    const diterimaBersih = Math.max(
        totalBersih + ppn - pph22 - pph23 - biayaMarketplace,
        0,
    );
    const piutang = Math.max(diterimaBersih - uangMasuk, 0);
    const labaKotor = totalBersih - hppTotal;
    const gpm = totalBersih > 0 ? (labaKotor / totalBersih) * 100 : 0;

    const legacyProductTotal = productItems.reduce(
        (sum, row) => sum + subtotal(row),
        0,
    );
    const legacyHpp = productItems.reduce(
        (sum, row) => sum + row.qty * row.hpp,
        0,
    );
    const legacyTotal = Math.max(
        legacyProductTotal + legacyJasaValue + legacyOngkir + legacyBiaya,
        0,
    );
    const legacyPiutang = Math.max(legacyTotal - legacyMasuk, 0);
    const legacyLaba = legacyTotal - legacyHpp;

    const updateItem = (id: string, patch: Partial<SalesItem>) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
        );
    };

    const updateProductItem = (id: string, patch: Partial<ProductItem>) => {
        setProductItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
        );
    };

    const chooseProductForSales = (id: string, productName: string) => {
        const product = produkList.find((item) => item.nama === productName);
        if (!product) {
            updateItem(id, { item: productName });
            return;
        }

        updateItem(id, {
            item: product.nama,
            harga: product.harga,
            hpp: product.hpp,
        });
    };

    const chooseProductLegacy = (id: string, productName: string) => {
        const product = produkList.find((item) => item.nama === productName);
        if (!product) {
            updateProductItem(id, { item: productName });
            return;
        }

        updateProductItem(id, {
            item: product.nama,
            satuan: product.satuan,
            harga: product.harga,
            hpp: product.hpp,
        });
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/pemasukan', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Input Penjualan" />
                <PemasukanSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Input Penjualan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Input Penjualan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Penjualan umum bisa mencatat produk stok, jasa, item
                            bebas, piutang, pajak, invoice, dan preview jurnal
                            otomatis.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLegacyProduk((value) => !value)}
                    >
                        <ArrowUpRight className="size-4" />
                        {showLegacyProduk
                            ? 'Sembunyikan Per Produk'
                            : 'Mode Per Produk'}
                    </Button>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="size-5" />
                                Penjualan Barang & Jasa
                            </CardTitle>
                            <CardDescription>
                                Lengkapi detail transaksi, item, pembayaran,
                                pajak, dan jurnal dalam satu alur.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        max={today}
                                        required
                                    />
                                </Field>
                                <Field label="Masuk ke Rekening">
                                    <NativeSelect name="akun_kas">
                                        {akunKas.map((account) => (
                                            <option
                                                key={account.kode}
                                                value={account.kode}
                                            >
                                                {account.kode} - {account.nama}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                                <Field
                                    label="Akun Pendapatan (COA)"
                                    hint="Opsional. Biarkan kosong untuk otomatis ke Pendapatan Penjualan / Jasa."
                                >
                                    <NativeSelect name="akun_pendapatan_kode">
                                        <option value="">-- Auto --</option>
                                        {akunPendapatan.map((account) => (
                                            <option
                                                key={account.kode}
                                                value={account.kode}
                                            >
                                                {account.kode} - {account.nama}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                                <Field label="Proyek" hint="Opsional">
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
                            </div>

                            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
                                <Field label="Keterangan" required>
                                    <Input
                                        name="keterangan"
                                        placeholder="Misal: Penjualan produk A, Invoice #001"
                                        required
                                    />
                                </Field>
                                <Field label="Nama Pelanggan">
                                    <Input
                                        name="pelanggan"
                                        list="customer-list"
                                        value={pelanggan}
                                        onChange={(event) =>
                                            setPelanggan(event.target.value)
                                        }
                                        placeholder="Cari / ketik nama pelanggan"
                                    />
                                    <datalist id="customer-list">
                                        {customerList.map((customer) => (
                                            <option
                                                key={customer}
                                                value={customer}
                                            />
                                        ))}
                                    </datalist>
                                    <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Checkbox
                                            name="simpan_customer"
                                            value="1"
                                        />
                                        <UserPlus className="size-3.5 text-emerald-600" />
                                        Simpan ke database customer
                                    </label>
                                </Field>
                            </div>

                            <section className="grid gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                        <List className="size-4" />
                                        Rincian Penjualan
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                                            {items.length}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setItems((current) => [
                                                ...current,
                                                emptySalesItem(),
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Tambah Baris
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[920px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="w-[32%] px-3 py-2">
                                                    Item *
                                                </th>
                                                <th className="w-[9%] px-3 py-2 text-center">
                                                    Qty
                                                </th>
                                                <th className="w-[16%] px-3 py-2">
                                                    Harga / Unit
                                                </th>
                                                <th className="w-[16%] px-3 py-2">
                                                    HPP / Modal
                                                </th>
                                                <th className="w-[13%] px-3 py-2">
                                                    Diskon
                                                </th>
                                                <th className="w-[12%] px-3 py-2 text-right">
                                                    Subtotal
                                                </th>
                                                <th className="w-[2%] px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            name="item_nama[]"
                                                            list="produk-list"
                                                            value={row.item}
                                                            onChange={(event) =>
                                                                chooseProductForSales(
                                                                    row.id,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Ketik bebas atau pilih produk"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            name="qty[]"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.qty}
                                                            onChange={(event) =>
                                                                updateItem(
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
                                                            className="text-center"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <MoneyInput
                                                            name="harga[]"
                                                            value={row.harga}
                                                            onChange={(event) =>
                                                                updateItem(
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
                                                    <td className="px-3 py-2">
                                                        <MoneyInput
                                                            name="hpp[]"
                                                            value={row.hpp}
                                                            onChange={(event) =>
                                                                updateItem(
                                                                    row.id,
                                                                    {
                                                                        hpp: numberValue(
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
                                                            name="diskon_item[]"
                                                            value={row.diskon}
                                                            onChange={(event) =>
                                                                updateItem(
                                                                    row.id,
                                                                    {
                                                                        diskon: numberValue(
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
                                                        {rupiah(subtotal(row))}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setItems(
                                                                    (
                                                                        current,
                                                                    ) =>
                                                                        current.length ===
                                                                        1
                                                                            ? [
                                                                                  emptySalesItem(),
                                                                              ]
                                                                            : current.filter(
                                                                                  (
                                                                                      item,
                                                                                  ) =>
                                                                                      item.id !==
                                                                                      row.id,
                                                                              ),
                                                                )
                                                            }
                                                            aria-label="Hapus baris"
                                                        >
                                                            <Trash2 className="size-4 text-red-600" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <datalist id="produk-list">
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
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ketik nama item apa saja, atau cari produk
                                    stok / Master HPP / resep. Produk yang
                                    dipilih mengisi harga dan HPP otomatis untuk
                                    preview margin.
                                </p>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Uang Masuk (Dibayar Sekarang)"
                                    hint="Kosongkan jika belum ada pembayaran."
                                >
                                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                        <MoneyInput
                                            name="uang_masuk"
                                            value={uangMasuk}
                                            onChange={(event) =>
                                                setUangMasuk(
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
                                                setUangMasuk(diterimaBersih)
                                            }
                                        >
                                            Bayar Penuh
                                        </Button>
                                    </div>
                                </Field>
                                <Field
                                    label="Valuasi Persediaan"
                                    hint="Stok saat ini"
                                >
                                    <div className="rounded-md border px-3 py-2 text-sm font-semibold">
                                        {rupiah(saldoPersediaan)}
                                        {hppTotal > saldoPersediaan && (
                                            <span className="ml-2 text-xs text-red-600">
                                                Melebihi saldo persediaan
                                            </span>
                                        )}
                                    </div>
                                </Field>
                                <Field
                                    label="Piutang"
                                    hint="= Total - Uang Masuk"
                                >
                                    <div className="rounded-md border bg-muted px-3 py-2 text-sm font-semibold text-amber-600">
                                        {rupiah(piutang)}
                                    </div>
                                </Field>
                            </section>

                            <section className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                        <SlidersHorizontal className="size-4" />
                                        Penyesuaian (Opsional)
                                    </div>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid gap-3 md:grid-cols-4">
                                    <Field label="Diskon">
                                        <MoneyInput
                                            name="diskon"
                                            value={diskon}
                                            onChange={(event) =>
                                                setDiskon(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Ongkir">
                                        <MoneyInput
                                            name="ongkir"
                                            value={ongkir}
                                            onChange={(event) =>
                                                setOngkir(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Biaya Transaksi"
                                        hint="Biaya yang ditagihkan ke pembeli, menambah pendapatan."
                                    >
                                        <MoneyInput
                                            name="biaya_lain"
                                            value={biaya}
                                            onChange={(event) =>
                                                setBiaya(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Biaya / Potongan Marketplace"
                                        hint="Diposting sebagai Beban Administrasi (6150)."
                                    >
                                        <MoneyInput
                                            name="biaya_mp"
                                            value={biayaMarketplace}
                                            onChange={(event) =>
                                                setBiayaMarketplace(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="w-fit px-0 text-xs"
                                    onClick={() =>
                                        setShowHelp((value) => !value)
                                    }
                                >
                                    <CircleHelp className="size-4" />
                                    Biaya Transaksi vs Potongan Marketplace
                                </Button>
                                {showHelp && (
                                    <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                        <p>
                                            <strong>Biaya Transaksi</strong>{' '}
                                            ditagihkan ke pembeli, menambah
                                            total penjualan dan kas yang
                                            diterima.
                                        </p>
                                        <p>
                                            <strong>
                                                Potongan Marketplace
                                            </strong>{' '}
                                            dipotong dari uang yang cair oleh
                                            marketplace. Pendapatan tetap kotor,
                                            potongan masuk beban.
                                        </p>
                                    </div>
                                )}
                            </section>

                            <section className="grid gap-3">
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <label className="flex items-start gap-3 text-sm font-semibold">
                                        <Checkbox
                                            checked={pajakAktif}
                                            onCheckedChange={(value) =>
                                                setPajakAktif(Boolean(value))
                                            }
                                        />
                                        <span>
                                            Tambahkan Fitur Pajak (PPN / PPh 22
                                            / PPh 23)
                                            <span className="block text-xs font-normal text-muted-foreground">
                                                Aktifkan kalau penjualan kena
                                                PPN, dipotong PPh 22, atau
                                                dipotong PPh 23.
                                            </span>
                                        </span>
                                    </label>
                                    {pajakAktif && (
                                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                                            <Field label="Tarif PPN (%)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={ppnPct}
                                                    onChange={(event) =>
                                                        setPpnPct(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <Field label="Dipotong PPh 22 (%)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={pph22Pct}
                                                    onChange={(event) =>
                                                        setPph22Pct(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <Field label="Dipotong PPh 23 (%)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={pph23Pct}
                                                    onChange={(event) =>
                                                        setPph23Pct(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <div className="overflow-hidden rounded-md border bg-background md:col-span-3">
                                                <div className="grid md:grid-cols-5">
                                                    <SummaryBox
                                                        title="DPP"
                                                        value={rupiah(
                                                            totalBersih,
                                                        )}
                                                        hint="dasar pajak"
                                                    />
                                                    <SummaryBox
                                                        title="+ PPN Keluaran"
                                                        value={rupiah(ppn)}
                                                        hint={`Hutang PPN +${rupiah(ppn)}`}
                                                        tone="green"
                                                    />
                                                    <SummaryBox
                                                        title="- PPh 22 Dimuka"
                                                        value={rupiah(pph22)}
                                                        hint={`PPh 22 +${rupiah(pph22)}`}
                                                        tone="red"
                                                    />
                                                    <SummaryBox
                                                        title="- PPh 23 Dimuka"
                                                        value={rupiah(pph23)}
                                                        hint={`PPh 23 +${rupiah(pph23)}`}
                                                        tone="red"
                                                    />
                                                    <SummaryBox
                                                        title="Diterima Bersih"
                                                        value={rupiah(
                                                            diterimaBersih,
                                                        )}
                                                        hint="setelah pajak"
                                                        tone="amber"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-md border bg-muted/30">
                                <div className="px-3 pt-3 text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                    Ringkasan Transaksi (Auto)
                                </div>
                                <div className="grid md:grid-cols-4">
                                    <SummaryBox
                                        title="Total Bersih"
                                        value={rupiah(totalBersih)}
                                        hint="setelah penyesuaian"
                                        tone="blue"
                                    />
                                    <SummaryBox
                                        title="HPP"
                                        value={rupiah(hppTotal)}
                                        hint="harga pokok"
                                        tone="red"
                                    />
                                    <SummaryBox
                                        title="Laba Kotor"
                                        value={rupiah(labaKotor)}
                                        hint="Total - HPP"
                                        tone={labaKotor >= 0 ? 'green' : 'red'}
                                    />
                                    <SummaryBox
                                        title="Gross Profit Margin"
                                        value={`${gpm.toFixed(1)}%`}
                                        hint="Laba / Total x 100%"
                                        tone={gpm >= 0 ? 'green' : 'red'}
                                    />
                                </div>
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
                                                account="Kas / Bank"
                                                debit={Math.min(
                                                    uangMasuk,
                                                    diterimaBersih,
                                                )}
                                                credit={0}
                                                impact="Uang diterima sekarang"
                                            />
                                            {piutang > 0 && (
                                                <JournalRow
                                                    account="Piutang Usaha"
                                                    debit={piutang}
                                                    credit={0}
                                                    impact="Sisa belum dibayar"
                                                />
                                            )}
                                            <JournalRow
                                                account="Pendapatan Penjualan / Jasa"
                                                debit={0}
                                                credit={totalBersih}
                                                impact="Laba rugi naik"
                                            />
                                            {biayaMarketplace > 0 && (
                                                <JournalRow
                                                    account="Beban Administrasi (6150)"
                                                    debit={biayaMarketplace}
                                                    credit={0}
                                                    impact="Potongan marketplace"
                                                />
                                            )}
                                            {ppn > 0 && (
                                                <JournalRow
                                                    account="Hutang PPN Keluaran"
                                                    debit={0}
                                                    credit={ppn}
                                                    impact="Kewajiban pajak"
                                                />
                                            )}
                                            {pph22 + pph23 > 0 && (
                                                <JournalRow
                                                    account="PPh Dibayar Dimuka"
                                                    debit={pph22 + pph23}
                                                    credit={0}
                                                    impact="Aset pajak dimuka"
                                                />
                                            )}
                                            {hppTotal > 0 && (
                                                <JournalRow
                                                    account="HPP / Persediaan"
                                                    debit={hppTotal}
                                                    credit={hppTotal}
                                                    impact="Catat modal dan kurangi stok"
                                                />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Preview ini mengikuti kalkulasi form dan
                                    belum menyimpan jurnal sampai backend
                                    finansial dipindahkan.
                                </p>
                            </section>

                            {piutang > 0 && (
                                <section className="rounded-md border p-3">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                        <HandCoins className="size-4" />
                                        Detail Piutang
                                    </div>
                                    <Field label="Jatuh Tempo">
                                        <Input type="date" name="jatuh_tempo" />
                                    </Field>
                                </section>
                            )}

                            <section className="grid gap-3">
                                <label className="flex items-start gap-3 text-sm font-semibold">
                                    <Checkbox
                                        name="buat_invoice"
                                        checked={buatInvoice}
                                        onCheckedChange={(value) =>
                                            setBuatInvoice(Boolean(value))
                                        }
                                    />
                                    <span>
                                        Buat & buka Invoice sekarang
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            Tanpa dicentang pun invoice dapat
                                            dicetak nanti dari detail transaksi.
                                        </span>
                                    </span>
                                </label>
                                {buatInvoice && (
                                    <div className="rounded-md border p-3">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                            <FileText className="size-4" />
                                            Detail Invoice
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-4">
                                            <Field
                                                label="Nama Pelanggan"
                                                required
                                            >
                                                <div className="grid gap-2">
                                                    <Input
                                                        value={invoicePelanggan}
                                                        onChange={(event) =>
                                                            setInvoicePelanggan(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        name="inv_pelanggan"
                                                        placeholder="Nama customer"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setInvoicePelanggan(
                                                                pelanggan,
                                                            )
                                                        }
                                                    >
                                                        <Copy className="size-4" />
                                                        Samakan dengan transaksi
                                                    </Button>
                                                </div>
                                            </Field>
                                            <Field label="No. Invoice">
                                                <Input
                                                    name="inv_nomor"
                                                    placeholder="Otomatis jika kosong"
                                                />
                                            </Field>
                                            <Field label="Telepon Pelanggan">
                                                <Input
                                                    name="inv_telepon_pelanggan"
                                                    placeholder="08xx..."
                                                />
                                            </Field>
                                            <Field label="Alamat Pelanggan">
                                                <Input
                                                    name="inv_alamat_pelanggan"
                                                    placeholder="Alamat singkat"
                                                />
                                            </Field>
                                            <Field label="Jatuh Tempo">
                                                <Input
                                                    type="date"
                                                    name="inv_jatuh_tempo"
                                                />
                                            </Field>
                                            <Field label="Catatan Invoice">
                                                <Input
                                                    name="inv_catatan_custom"
                                                    placeholder="Opsional"
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Simpan Penjualan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {showLegacyProduk && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ReceiptText className="size-5 text-sky-600" />
                                Penjualan per Produk
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        defaultValue={today}
                                        max={today}
                                        required
                                    />
                                </Field>
                                <Field label="Masuk ke Rekening">
                                    <NativeSelect>
                                        {akunKas.map((account) => (
                                            <option key={account.kode}>
                                                {account.kode} - {account.nama}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                                <Field label="Pelanggan">
                                    <Input
                                        list="customer-list"
                                        placeholder="Cari / ketik nama"
                                    />
                                </Field>
                                <Field label="Keterangan">
                                    <Input placeholder="Keterangan tambahan" />
                                </Field>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                    Daftar Produk
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                                        {productItems.length}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setProductItems((current) => [
                                            ...current,
                                            emptyProductItem(),
                                        ])
                                    }
                                >
                                    <Plus className="size-4" />
                                    Tambah Produk
                                </Button>
                            </div>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full min-w-[860px] text-sm">
                                    <thead className="bg-muted/60">
                                        <tr className="text-left">
                                            <th className="px-3 py-2">
                                                Produk
                                            </th>
                                            <th className="px-3 py-2 text-center">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-center">
                                                Satuan
                                            </th>
                                            <th className="px-3 py-2">
                                                Harga / Unit
                                            </th>
                                            <th className="px-3 py-2">
                                                Diskon Item
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Subtotal
                                            </th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productItems.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-t"
                                            >
                                                <td className="px-3 py-2">
                                                    <Input
                                                        list="produk-list"
                                                        value={row.item}
                                                        onChange={(event) =>
                                                            chooseProductLegacy(
                                                                row.id,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={row.qty}
                                                        onChange={(event) =>
                                                            updateProductItem(
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
                                                <td className="px-3 py-2 text-center">
                                                    {row.satuan || '-'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <MoneyInput
                                                        value={row.harga}
                                                        onChange={(event) =>
                                                            updateProductItem(
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
                                                <td className="px-3 py-2">
                                                    <MoneyInput
                                                        value={row.diskon}
                                                        onChange={(event) =>
                                                            updateProductItem(
                                                                row.id,
                                                                {
                                                                    diskon: numberValue(
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
                                                    {rupiah(subtotal(row))}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setProductItems(
                                                                (current) =>
                                                                    current.length ===
                                                                    1
                                                                        ? [
                                                                              emptyProductItem(),
                                                                          ]
                                                                        : current.filter(
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
                            <label className="rounded-md border bg-muted/30 p-3 text-sm font-semibold">
                                <span className="flex items-start gap-3">
                                    <Checkbox
                                        checked={legacyJasa}
                                        onCheckedChange={(value) =>
                                            setLegacyJasa(Boolean(value))
                                        }
                                    />
                                    <span>
                                        Tambah Biaya Jasa / Non-SKU
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            Misalnya jasa pasang, desain, atau
                                            pekerjaan non-stok.
                                        </span>
                                    </span>
                                </span>
                            </label>
                            {legacyJasa && (
                                <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
                                    <Field label="Keterangan Jasa">
                                        <Input placeholder="Mis: Jasa pemasangan kolam" />
                                    </Field>
                                    <Field label="Biaya Jasa">
                                        <MoneyInput
                                            value={legacyJasaValue}
                                            onChange={(event) =>
                                                setLegacyJasaValue(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            )}
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="Ongkir">
                                    <MoneyInput
                                        value={legacyOngkir}
                                        onChange={(event) =>
                                            setLegacyOngkir(
                                                numberValue(event.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Biaya Transaksi">
                                    <MoneyInput
                                        value={legacyBiaya}
                                        onChange={(event) =>
                                            setLegacyBiaya(
                                                numberValue(event.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Uang Masuk (Dibayar)">
                                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                        <MoneyInput
                                            value={legacyMasuk}
                                            onChange={(event) =>
                                                setLegacyMasuk(
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
                                                setLegacyMasuk(legacyTotal)
                                            }
                                        >
                                            Penuh
                                        </Button>
                                    </div>
                                </Field>
                            </div>
                            <label className="rounded-md border bg-muted/30 p-3 text-sm font-semibold">
                                <span className="flex items-start gap-3">
                                    <Checkbox
                                        checked={legacyPajak}
                                        onCheckedChange={(value) =>
                                            setLegacyPajak(Boolean(value))
                                        }
                                    />
                                    <span>
                                        Tambahkan Pajak Produk (PPN / PPh 22 /
                                        PPh 23)
                                    </span>
                                </span>
                            </label>
                            {legacyPajak && (
                                <div className="grid gap-3 md:grid-cols-3">
                                    <Field label="Tarif PPN (%)">
                                        <Input
                                            type="number"
                                            defaultValue={11}
                                        />
                                    </Field>
                                    <Field label="Dipotong PPh 22 (%)">
                                        <Input type="number" defaultValue={0} />
                                    </Field>
                                    <Field label="Dipotong PPh 23 (%)">
                                        <Input type="number" defaultValue={0} />
                                    </Field>
                                </div>
                            )}
                            <section className="overflow-hidden rounded-md border bg-muted/30">
                                <div className="px-3 pt-3 text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                    Ringkasan Invoice (Auto)
                                </div>
                                <div className="grid md:grid-cols-4">
                                    <SummaryBox
                                        title="Total Invoice"
                                        value={rupiah(legacyTotal)}
                                        hint="subtotal + adj."
                                        tone="blue"
                                    />
                                    <SummaryBox
                                        title="HPP Total"
                                        value={rupiah(legacyHpp)}
                                        hint="akumulasi item"
                                        tone="red"
                                    />
                                    <SummaryBox
                                        title="Laba Kotor"
                                        value={rupiah(legacyLaba)}
                                        hint="total - HPP"
                                        tone={legacyLaba >= 0 ? 'green' : 'red'}
                                    />
                                    <SummaryBox
                                        title="Piutang"
                                        value={rupiah(legacyPiutang)}
                                        hint="invoice - uang masuk"
                                        tone="amber"
                                    />
                                </div>
                            </section>
                            <div className="grid gap-3 rounded-md border p-3">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                                    <Scale className="size-4" />
                                    Preview Jurnal Otomatis
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Produk, HPP, jasa, piutang, dan pajak akan
                                    dipetakan ke jurnal otomatis setelah backend
                                    finansial dipindahkan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function PemasukanSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-10 w-full sm:w-44" />
            </div>

            <Card>
                <CardHeader className="border-b">
                    <Skeleton className="h-6 w-56" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="grid gap-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
                        <div className="grid gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-44" />
                            <Skeleton className="h-9 w-32" />
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
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="grid gap-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-20 w-full rounded-md"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-28 w-full rounded-md" />
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
