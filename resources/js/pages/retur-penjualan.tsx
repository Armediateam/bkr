import { Head, Link, useForm } from '@inertiajs/react';
import {
    Banknote,
    Boxes,
    FileText,
    Plus,
    RotateCcw,
    Save,
    Scale,
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
    kode: string;
    nama: string;
    hargaJual: number;
    hpp: number;
};

type ReceivableOption = {
    id: number;
    pelanggan: string;
    keterangan: string;
    sisa: number;
};

type ProductRow = {
    id: string;
    produkId: string;
    qty: number;
    hargaJual: number;
    hpp: number;
};

type ReturPenjualanProps = {
    today: string;
    akunKas: Account[];
    produkList: ProductOption[];
    customerList: string[];
    piutangAktif: ReceivableOption[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const emptyProductRow = (): ProductRow => ({
    id: makeId(),
    produkId: '',
    qty: 1,
    hargaJual: 0,
    hpp: 0,
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

function accountLabel(account?: Account): string {
    return account ? `${account.kode} - ${account.nama}` : '';
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

export default function ReturPenjualan({
    today,
    akunKas,
    produkList,
    customerList,
    piutangAktif,
}: ReturPenjualanProps) {
    const [mode, setMode] = useState<'umum' | 'produk'>('umum');
    const [sumberUmum, setSumberUmum] = useState<'kas' | 'piutang'>('kas');
    const [sumberProduk, setSumberProduk] = useState<'kas' | 'piutang'>('kas');
    const [akunKasUmum, setAkunKasUmum] = useState(akunKas[0]?.kode ?? '');
    const [akunKasProduk, setAkunKasProduk] = useState(akunKas[0]?.kode ?? '');
    const [nominal, setNominal] = useState(0);
    const [hppBalik, setHppBalik] = useState(0);
    const [productRows, setProductRows] = useState<ProductRow[]>([
        emptyProductRow(),
    ]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const productTotal = useMemo(
        () =>
            productRows.reduce((sum, row) => sum + row.qty * row.hargaJual, 0),
        [productRows],
    );
    const productHpp = useMemo(
        () => productRows.reduce((sum, row) => sum + row.qty * row.hpp, 0),
        [productRows],
    );
    const activeSumber = mode === 'umum' ? sumberUmum : sumberProduk;
    const activeKasCode = mode === 'umum' ? akunKasUmum : akunKasProduk;
    const activeKas = akunKas.find((account) => account.kode === activeKasCode);
    const activeNominal = mode === 'umum' ? nominal : productTotal;
    const activeHpp = mode === 'umum' ? hppBalik : productHpp;
    const contraAccount =
        activeSumber === 'piutang'
            ? '1120 - Piutang Usaha'
            : accountLabel(activeKas) || '1100 - Kas';

    const journalRows = useMemo(() => {
        const rows = [
            {
                account: '4150 - Retur Penjualan',
                debit: activeNominal,
                credit: 0,
                impact: 'Kontra pendapatan bertambah',
            },
            {
                account: contraAccount,
                debit: 0,
                credit: activeNominal,
                impact:
                    activeSumber === 'piutang'
                        ? 'Piutang pelanggan berkurang'
                        : 'Kas/bank keluar untuk refund',
            },
            {
                account: '1130 - Persediaan Barang',
                debit: activeHpp,
                credit: 0,
                impact: 'Barang retur masuk kembali ke stok',
            },
            {
                account: '5100 - Harga Pokok Penjualan',
                debit: 0,
                credit: activeHpp,
                impact: 'HPP penjualan dibalik',
            },
        ];

        return rows.filter((row) => row.debit > 0 || row.credit > 0);
    }, [activeHpp, activeNominal, activeSumber, contraAccount]);

    const totals = journalRows.reduce(
        (sum, row) => ({
            debit: sum.debit + row.debit,
            credit: sum.credit + row.credit,
        }),
        { debit: 0, credit: 0 },
    );

    const chooseProduct = (rowId: string, productId: string) => {
        const product = produkList.find(
            (item) => String(item.id) === productId,
        );
        setProductRows((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          produkId: productId,
                          hargaJual: product?.hargaJual ?? 0,
                          hpp: product?.hpp ?? 0,
                      }
                    : row,
            ),
        );
    };

    const updateProductRow = (rowId: string, patch: Partial<ProductRow>) => {
        setProductRows((rows) =>
            rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/retur-penjualan', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Retur Penjualan" />
                <ReturPenjualanSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Retur Penjualan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Retur Penjualan
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Catat refund pelanggan, potong piutang, barang yang
                            kembali ke stok, dan pembalikan HPP.
                        </p>
                    </div>
                    <div className="flex rounded-md border p-1">
                        <Button
                            type="button"
                            size="sm"
                            variant={mode === 'umum' ? 'default' : 'ghost'}
                            onClick={() => setMode('umum')}
                        >
                            <FileText className="size-4" />
                            Umum
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={mode === 'produk' ? 'default' : 'ghost'}
                            onClick={() => setMode('produk')}
                        >
                            <Boxes className="size-4" />
                            Per Produk
                        </Button>
                    </div>
                </div>

                <Card className="border-border/70 bg-muted/30">
                    <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
                        <RotateCcw className="mt-0.5 size-5 shrink-0" />
                        <p>
                            Retur penjualan mencatat barang atau uang yang
                            dikembalikan oleh pelanggan. Jurnal utama: debit{' '}
                            <span className="font-medium text-foreground">
                                4150 Retur Penjualan
                            </span>
                            , kredit kas/bank atau piutang. Jika produk masuk
                            kembali ke stok, HPP ikut dibalik.
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <RotateCcw className="size-5" />
                                {mode === 'umum'
                                    ? 'Retur Penjualan Nominal'
                                    : 'Retur Penjualan Per Produk'}
                            </CardTitle>
                            <CardDescription>
                                {mode === 'umum'
                                    ? 'Gunakan mode ini saat retur dicatat langsung berdasarkan nominal.'
                                    : 'Gunakan mode ini saat item retur perlu masuk kembali ke stok dan HPP dibalik per produk.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            {mode === 'umum' ? (
                                <GeneralReturnForm
                                    today={today}
                                    akunKas={akunKas}
                                    customerList={customerList}
                                    piutangAktif={piutangAktif}
                                    sumber={sumberUmum}
                                    setSumber={setSumberUmum}
                                    akunKasCode={akunKasUmum}
                                    setAkunKasCode={setAkunKasUmum}
                                    nominal={nominal}
                                    setNominal={setNominal}
                                    hppBalik={hppBalik}
                                    setHppBalik={setHppBalik}
                                />
                            ) : (
                                <ProductReturnForm
                                    today={today}
                                    akunKas={akunKas}
                                    produkList={produkList}
                                    customerList={customerList}
                                    piutangAktif={piutangAktif}
                                    sumber={sumberProduk}
                                    setSumber={setSumberProduk}
                                    akunKasCode={akunKasProduk}
                                    setAkunKasCode={setAkunKasProduk}
                                    productRows={productRows}
                                    setProductRows={setProductRows}
                                    chooseProduct={chooseProduct}
                                    updateProductRow={updateProductRow}
                                    total={productTotal}
                                />
                            )}

                            <JournalPreview
                                rows={journalRows}
                                totals={totals}
                            />

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    {mode === 'umum'
                                        ? 'Catat Retur Penjualan'
                                        : 'Catat Retur per Produk'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function GeneralReturnForm({
    today,
    akunKas,
    customerList,
    piutangAktif,
    sumber,
    setSumber,
    akunKasCode,
    setAkunKasCode,
    nominal,
    setNominal,
    hppBalik,
    setHppBalik,
}: {
    today: string;
    akunKas: Account[];
    customerList: string[];
    piutangAktif: ReceivableOption[];
    sumber: 'kas' | 'piutang';
    setSumber: (value: 'kas' | 'piutang') => void;
    akunKasCode: string;
    setAkunKasCode: (value: string) => void;
    nominal: number;
    setNominal: (value: number) => void;
    hppBalik: number;
    setHppBalik: (value: number) => void;
}) {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="mode" value="umum" />
            <Field label="Tanggal" required>
                <Input
                    type="date"
                    name="tanggal"
                    defaultValue={today}
                    max={today}
                    required
                />
            </Field>
            <Field label="Sumber Pembayaran Retur" required>
                <NativeSelect
                    name="sumber"
                    value={sumber}
                    onChange={(event) =>
                        setSumber(event.target.value as 'kas' | 'piutang')
                    }
                >
                    <option value="kas">Refund Tunai (Kas/Bank keluar)</option>
                    <option value="piutang">
                        Potong Piutang (belum dibayar)
                    </option>
                </NativeSelect>
            </Field>
            {sumber === 'kas' && (
                <Field label="Rekening Kas/Bank">
                    <NativeSelect
                        name="akun_kas"
                        value={akunKasCode}
                        onChange={(event) => setAkunKasCode(event.target.value)}
                    >
                        {akunKas.map((account) => (
                            <option key={account.kode} value={account.kode}>
                                {account.kode} - {account.nama}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
            )}
            <Field
                label="Nama Pelanggan"
                hint={
                    sumber === 'piutang'
                        ? 'Wajib diisi jika sumber = potong piutang.'
                        : undefined
                }
            >
                <Input
                    name="pelanggan"
                    list="customer-retur-list"
                    placeholder="Ketik / pilih pelanggan"
                />
                <CustomerList customerList={customerList} />
            </Field>
            {sumber === 'piutang' && (
                <Field
                    label="Piutang Sumber"
                    hint="Pilih jika ada beberapa invoice/piutang pelanggan yang mirip."
                >
                    <NativeSelect name="piutang_id">
                        <option value="">Auto cari dari nama + nominal</option>
                        {piutangAktif.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.pelanggan} - {item.keterangan} - sisa{' '}
                                {rupiah(item.sisa)}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
            )}
            <Field label="Keterangan" required>
                <Input
                    name="keterangan"
                    placeholder="Mis: Retur invoice #001, produk rusak"
                    required
                />
            </Field>
            <Field label="Nominal Retur" required>
                <MoneyInput
                    name="nominal"
                    value={nominal || ''}
                    onChange={(event) =>
                        setNominal(numberValue(event.target.value))
                    }
                    required
                    placeholder="0"
                />
            </Field>
            <Field
                label="HPP yang Dibalik"
                hint="Isi jika barang fisik masuk balik ke stok."
            >
                <MoneyInput
                    name="hpp_balik"
                    value={hppBalik || ''}
                    onChange={(event) =>
                        setHppBalik(numberValue(event.target.value))
                    }
                    placeholder="0"
                />
            </Field>
        </section>
    );
}

function ProductReturnForm({
    today,
    akunKas,
    produkList,
    customerList,
    piutangAktif,
    sumber,
    setSumber,
    akunKasCode,
    setAkunKasCode,
    productRows,
    setProductRows,
    chooseProduct,
    updateProductRow,
    total,
}: {
    today: string;
    akunKas: Account[];
    produkList: ProductOption[];
    customerList: string[];
    piutangAktif: ReceivableOption[];
    sumber: 'kas' | 'piutang';
    setSumber: (value: 'kas' | 'piutang') => void;
    akunKasCode: string;
    setAkunKasCode: (value: string) => void;
    productRows: ProductRow[];
    setProductRows: React.Dispatch<React.SetStateAction<ProductRow[]>>;
    chooseProduct: (rowId: string, productId: string) => void;
    updateProductRow: (rowId: string, patch: Partial<ProductRow>) => void;
    total: number;
}) {
    return (
        <section className="grid gap-6">
            <input type="hidden" name="mode" value="produk" />
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
                <Field label="Sumber Pembayaran Retur" required>
                    <NativeSelect
                        name="sumber"
                        value={sumber}
                        onChange={(event) =>
                            setSumber(event.target.value as 'kas' | 'piutang')
                        }
                    >
                        <option value="kas">
                            Refund Tunai (Kas/Bank keluar)
                        </option>
                        <option value="piutang">
                            Potong Piutang (belum dibayar)
                        </option>
                    </NativeSelect>
                </Field>
                {sumber === 'kas' && (
                    <Field label="Rekening Kas/Bank">
                        <NativeSelect
                            name="akun_kas"
                            value={akunKasCode}
                            onChange={(event) =>
                                setAkunKasCode(event.target.value)
                            }
                        >
                            {akunKas.map((account) => (
                                <option key={account.kode} value={account.kode}>
                                    {account.kode} - {account.nama}
                                </option>
                            ))}
                        </NativeSelect>
                    </Field>
                )}
                <Field label="Nama Pelanggan">
                    <Input
                        name="pelanggan"
                        list="customer-retur-list"
                        placeholder="Ketik / pilih pelanggan"
                    />
                    <CustomerList customerList={customerList} />
                </Field>
                {sumber === 'piutang' && (
                    <Field label="Piutang Sumber">
                        <NativeSelect name="piutang_id">
                            <option value="">
                                Auto cari dari nama + nominal
                            </option>
                            {piutangAktif.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.pelanggan} - {item.keterangan} - sisa{' '}
                                    {rupiah(item.sisa)}
                                </option>
                            ))}
                        </NativeSelect>
                    </Field>
                )}
                <Field label="Keterangan" required>
                    <Input
                        name="keterangan"
                        placeholder="Mis: Retur invoice #001"
                        required
                    />
                </Field>
            </div>

            <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                    <Label>Produk yang Diretur</Label>
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
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-muted/60">
                            <tr className="text-left">
                                <th className="px-3 py-2">Produk</th>
                                <th className="w-28 px-3 py-2">Qty</th>
                                <th className="w-44 px-3 py-2">Harga Jual</th>
                                <th className="w-40 px-3 py-2 text-right">
                                    Subtotal
                                </th>
                                <th className="w-12 px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productRows.map((row) => (
                                <tr key={row.id} className="border-t">
                                    <td className="px-3 py-2">
                                        <NativeSelect
                                            name="produk_id[]"
                                            value={row.produkId}
                                            onChange={(event) =>
                                                chooseProduct(
                                                    row.id,
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- pilih produk --
                                            </option>
                                            {produkList.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.kode},{' '}
                                                    {product.nama}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            name="qty[]"
                                            value={row.qty}
                                            onChange={(event) =>
                                                updateProductRow(row.id, {
                                                    qty: numberValue(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <MoneyInput
                                            name="harga_jual[]"
                                            value={row.hargaJual || ''}
                                            onChange={(event) =>
                                                updateProductRow(row.id, {
                                                    hargaJual: numberValue(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {rupiah(row.qty * row.hargaJual)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setProductRows((rows) =>
                                                    rows.length > 1
                                                        ? rows.filter(
                                                              (item) =>
                                                                  item.id !==
                                                                  row.id,
                                                          )
                                                        : [emptyProductRow()],
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
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Retur
                    </span>
                    <span className="text-xl font-semibold">
                        {rupiah(total)}
                    </span>
                </div>
            </div>
        </section>
    );
}

function CustomerList({ customerList }: { customerList: string[] }) {
    return (
        <datalist id="customer-retur-list">
            {customerList.map((name) => (
                <option key={name} value={name} />
            ))}
        </datalist>
    );
}

function JournalPreview({
    rows,
    totals,
}: {
    rows: Array<{
        account: string;
        debit: number;
        credit: number;
        impact: string;
    }>;
    totals: { debit: number; credit: number };
}) {
    return (
        <section className="grid gap-3 rounded-md border p-4">
            <CardTitle className="flex items-center gap-2 text-sm">
                <Scale className="size-5" />
                Preview Jurnal Otomatis
            </CardTitle>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/60">
                        <tr className="text-left">
                            <th className="px-3 py-2">Akun</th>
                            <th className="px-3 py-2 text-right">Debit</th>
                            <th className="px-3 py-2 text-right">Kredit</th>
                            <th className="px-3 py-2">Dampak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-6 text-center text-muted-foreground"
                                >
                                    Isi nominal atau produk untuk melihat jurnal
                                    otomatis.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {rows.map((row, index) => (
                                    <tr
                                        key={`${row.account}-${index}`}
                                        className="border-t"
                                    >
                                        <td className="px-3 py-2 font-medium">
                                            {row.account}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {row.debit > 0
                                                ? rupiah(row.debit)
                                                : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {row.credit > 0
                                                ? rupiah(row.credit)
                                                : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {row.impact}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t bg-muted/30 font-semibold">
                                    <td className="px-3 py-2">Total</td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(totals.debit)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {rupiah(totals.credit)}
                                    </td>
                                    <td className="px-3 py-2"></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground">
                Retur penjualan mengurangi pendapatan. Jika HPP dibalik,
                persediaan naik dan HPP turun.
            </p>
        </section>
    );
}

function ReturPenjualanSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-10 w-56" />
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="grid gap-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-40 w-full rounded-md" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-44" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
