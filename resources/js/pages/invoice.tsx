import { Head, Link, useForm } from '@inertiajs/react';
import {
    Eye,
    FileText,
    Plus,
    Printer,
    ReceiptText,
    Save,
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
import { Textarea } from '@/components/ui/textarea';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Product = { id: number; nama: string; satuan: string; harga: number };
type Account = { kode: string; nama: string };
type InvoiceRow = {
    id: number;
    nomor: string;
    tanggal: string;
    pelanggan: string;
    total: number;
    jatuhTempo: string;
    status: 'DRAFT' | 'SENT' | 'PAID';
    jurnalId: number | null;
};
type ItemRow = {
    id: string;
    deskripsi: string;
    qty: number;
    satuan: string;
    harga: number;
    diskon: number;
};

type InvoiceProps = {
    today: string;
    nextNumber: string;
    customers: string[];
    products: Product[];
    akunKas: Account[];
    invoices: InvoiceRow[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);
const emptyItem = (): ItemRow => ({
    id: makeId(),
    deskripsi: '',
    qty: 1,
    satuan: 'pcs',
    harga: 0,
    diskon: 0,
});

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function numberValue(value: string | number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

function subtotal(row: ItemRow): number {
    return Math.max(row.qty * row.harga - row.diskon, 0);
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

export default function Invoice({
    today,
    nextNumber,
    customers,
    products,
    akunKas,
    invoices,
}: InvoiceProps) {
    const [status, setStatus] = useState<'ALL' | 'DRAFT' | 'SENT' | 'PAID'>(
        'ALL',
    );
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
    const [diskon, setDiskon] = useState(0);
    const [ongkir, setOngkir] = useState(0);
    const [biayaLain, setBiayaLain] = useState(0);
    const [pajakAktif, setPajakAktif] = useState(false);
    const [pajakPct, setPajakPct] = useState(11);
    const [pphAktif, setPphAktif] = useState(false);
    const [pphPct, setPphPct] = useState(2);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesStatus = status === 'ALL' || invoice.status === status;
        const matchesQuery = [invoice.nomor, invoice.pelanggan]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
    });
    const itemsTotal = items.reduce((sum, row) => sum + subtotal(row), 0);
    const dpp = Math.max(itemsTotal - diskon + ongkir + biayaLain, 0);
    const pajak = pajakAktif ? dpp * (pajakPct / 100) : 0;
    const pph = pphAktif ? dpp * (pphPct / 100) : 0;
    const grandTotal = Math.max(dpp + pajak - pph, 0);

    const addProduct = (productId: string) => {
        const product = products.find((item) => String(item.id) === productId);
        if (!product) return;
        setItems((rows) => [
            ...rows,
            {
                id: makeId(),
                deskripsi: product.nama,
                qty: 1,
                satuan: product.satuan,
                harga: product.harga,
                diskon: 0,
            },
        ]);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/invoice', { preserveScroll: true });
    };

    if (showSkeleton)
        return (
            <>
                <Head title="Invoice" />
                <InvoiceSkeleton />
            </>
        );

    return (
        <>
            <Head title="Invoice" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Daftar Invoice
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Invoice adalah dokumen tagihan. Untuk pembukuan, catat
                        ke jurnal atau pakai menu Penjualan.
                    </p>
                </div>

                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="size-5" />
                                Invoice
                            </CardTitle>
                            <CardDescription>
                                Filter, cari, dan kelola status invoice.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(['ALL', 'DRAFT', 'SENT', 'PAID'] as const).map(
                                (item) => (
                                    <Button
                                        key={item}
                                        type="button"
                                        variant={
                                            status === item
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => setStatus(item)}
                                    >
                                        {item === 'ALL'
                                            ? 'Semua'
                                            : item === 'SENT'
                                              ? 'Terkirim'
                                              : item === 'PAID'
                                                ? 'Lunas'
                                                : 'Draft'}
                                    </Button>
                                ),
                            )}
                            <Input
                                className="w-60"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Cari pelanggan / nomor..."
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">
                                            No. Invoice
                                        </th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Pelanggan</th>
                                        <th className="px-3 py-2 text-right">
                                            Total
                                        </th>
                                        <th className="px-3 py-2">
                                            Jatuh Tempo
                                        </th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-2 font-mono font-semibold">
                                                {invoice.nomor}
                                                {invoice.jurnalId && (
                                                    <span className="ml-2 rounded-full border px-2 py-0.5 font-sans text-xs">
                                                        Transaksi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {invoice.tanggal}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {invoice.pelanggan}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {rupiah(invoice.total)}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {invoice.jatuhTempo}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <Printer className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ReceiptText className="size-5" />
                                Buat Invoice Baru
                            </CardTitle>
                            <CardDescription>
                                Dokumen tagihan dengan item, penyesuaian, pajak,
                                dan opsi pembayaran.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <div className="grid gap-4 md:grid-cols-5">
                                <Field label="No. Invoice">
                                    <Input
                                        name="nomor"
                                        placeholder={nextNumber}
                                    />
                                </Field>
                                <Field label="Tanggal">
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        max={today}
                                    />
                                </Field>
                                <Field label="ToP (hari)">
                                    <Input
                                        type="number"
                                        name="top_hari"
                                        defaultValue={30}
                                    />
                                </Field>
                                <Field label="Ket. ToP">
                                    <Input
                                        name="top_note"
                                        placeholder="Net 30 / COD"
                                    />
                                </Field>
                                <Field label="Jatuh Tempo">
                                    <Input type="date" name="jatuh_tempo" />
                                </Field>
                                <Field label="Nama Pelanggan">
                                    <Input
                                        name="pelanggan"
                                        list="invoice-customer-list"
                                        placeholder="Nama perusahaan / individu"
                                    />
                                    <datalist id="invoice-customer-list">
                                        {customers.map((customer) => (
                                            <option
                                                key={customer}
                                                value={customer}
                                            />
                                        ))}
                                    </datalist>
                                </Field>
                                <Field label="Telepon">
                                    <Input
                                        name="telepon_pelanggan"
                                        placeholder="08xx..."
                                    />
                                </Field>
                                <Field label="Alamat">
                                    <Input
                                        name="alamat_pelanggan"
                                        placeholder="Alamat singkat"
                                    />
                                </Field>
                                <Field label="Terima DP / Pembayaran">
                                    <Input
                                        type="number"
                                        name="dp_nominal"
                                        placeholder="0"
                                    />
                                </Field>
                                <Field label="Masuk ke Rekening">
                                    <select
                                        name="akun_kas"
                                        className="h-9 rounded-md border bg-background px-3 text-sm"
                                    >
                                        {akunKas.map((account) => (
                                            <option
                                                key={account.kode}
                                                value={account.kode}
                                            >
                                                {account.kode} - {account.nama}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Item / Produk</Label>
                                    <div className="flex gap-2">
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            onChange={(event) => {
                                                addProduct(event.target.value);
                                                event.target.value = '';
                                            }}
                                        >
                                            <option value="">
                                                + Dari katalog produk
                                            </option>
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setItems((rows) => [
                                                    ...rows,
                                                    emptyItem(),
                                                ])
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Baris
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[860px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="px-3 py-2">
                                                    Deskripsi
                                                </th>
                                                <th className="px-3 py-2">
                                                    Qty
                                                </th>
                                                <th className="px-3 py-2">
                                                    Satuan
                                                </th>
                                                <th className="px-3 py-2">
                                                    Harga
                                                </th>
                                                <th className="px-3 py-2">
                                                    Diskon
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Subtotal
                                                </th>
                                                <th></th>
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
                                                            value={
                                                                row.deskripsi
                                                            }
                                                            onChange={(event) =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
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
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={row.qty}
                                                            onChange={(event) =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          qty: numberValue(
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                          ),
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            value={row.satuan}
                                                            onChange={(event) =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
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
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={row.harga}
                                                            onChange={(event) =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          harga: numberValue(
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                          ),
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={row.diskon}
                                                            onChange={(event) =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          diskon: numberValue(
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                          ),
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold">
                                                        {rupiah(subtotal(row))}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setItems(
                                                                    (rows) =>
                                                                        rows.length >
                                                                        1
                                                                            ? rows.filter(
                                                                                  (
                                                                                      item,
                                                                                  ) =>
                                                                                      item.id !==
                                                                                      row.id,
                                                                              )
                                                                            : [
                                                                                  emptyItem(),
                                                                              ],
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
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                                <Field label="Catatan / Pesan">
                                    <Textarea
                                        name="catatan"
                                        placeholder="Terima kasih atas kepercayaan Anda..."
                                    />
                                </Field>
                                <Card className="border-border/70 bg-muted/30">
                                    <CardContent className="grid gap-3 pt-6 text-sm">
                                        <Field label="Diskon Global">
                                            <Input
                                                type="number"
                                                value={diskon || ''}
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
                                            <Input
                                                type="number"
                                                value={ongkir || ''}
                                                onChange={(event) =>
                                                    setOngkir(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Biaya Lain">
                                            <Input
                                                type="number"
                                                value={biayaLain || ''}
                                                onChange={(event) =>
                                                    setBiayaLain(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                        <label className="flex items-start gap-2">
                                            <Checkbox
                                                checked={pajakAktif}
                                                onCheckedChange={(v) =>
                                                    setPajakAktif(v === true)
                                                }
                                            />
                                            <span>Tambahkan Pajak (PPN)</span>
                                        </label>
                                        {pajakAktif && (
                                            <Field label="Tarif Pajak (%)">
                                                <Input
                                                    type="number"
                                                    value={pajakPct}
                                                    onChange={(event) =>
                                                        setPajakPct(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Field>
                                        )}
                                        <label className="flex items-start gap-2">
                                            <Checkbox
                                                checked={pphAktif}
                                                onCheckedChange={(v) =>
                                                    setPphAktif(v === true)
                                                }
                                            />
                                            <span>PPh 23 Dipotong</span>
                                        </label>
                                        {pphAktif && (
                                            <Field label="Tarif PPh 23 (%)">
                                                <Input
                                                    type="number"
                                                    value={pphPct}
                                                    onChange={(event) =>
                                                        setPphPct(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Field>
                                        )}
                                        <div className="grid gap-1 border-t pt-3">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <strong>
                                                    {rupiah(itemsTotal)}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>DPP</span>
                                                <span>{rupiah(dpp)}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>PPN</span>
                                                <span>{rupiah(pajak)}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>PPh 23</span>
                                                <span>{rupiah(pph)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                                <span>Total</span>
                                                <span>
                                                    {rupiah(grandTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Simpan Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function InvoiceSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-md" />
            <Skeleton className="h-[640px] w-full rounded-md" />
        </div>
    );
}
