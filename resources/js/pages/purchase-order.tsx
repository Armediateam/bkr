import { Head, Link, useForm } from '@inertiajs/react';
import {
    Eye,
    FileText,
    Plus,
    Printer,
    Save,
    ShoppingCart,
    Trash2,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Vendor = { nama: string; alamat: string; kontak: string };
type Product = { id: number; nama: string; satuan: string; hargaBeli: number };
type PurchaseOrderRow = {
    id: number;
    nomor: string;
    vendor: string;
    tanggal: string;
    expectedDate: string;
    total: number;
    status: 'DRAFT' | 'DIKIRIM' | 'DITERIMA' | 'DIBATALKAN';
};
type ItemRow = {
    id: string;
    produkId: string;
    deskripsi: string;
    qty: number;
    satuan: string;
    harga: number;
    diskon: number;
};

type PurchaseOrderProps = {
    today: string;
    nextNumber: string;
    vendors: Vendor[];
    products: Product[];
    purchaseOrders: PurchaseOrderRow[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);
const emptyItem = (): ItemRow => ({
    id: makeId(),
    produkId: '',
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

export default function PurchaseOrder({
    today,
    nextNumber,
    vendors,
    products,
    purchaseOrders,
}: PurchaseOrderProps) {
    const [status, setStatus] = useState<'ALL' | PurchaseOrderRow['status']>(
        'ALL',
    );
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
    const [diskon, setDiskon] = useState(0);
    const [ongkir, setOngkir] = useState(0);
    const [biayaLain, setBiayaLain] = useState(0);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = purchaseOrders.filter((po) => {
        const matchesStatus = status === 'ALL' || po.status === status;
        const matchesQuery = [po.nomor, po.vendor]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
    });
    const itemsTotal = items.reduce((sum, row) => sum + subtotal(row), 0);
    const grandTotal = Math.max(itemsTotal - diskon + ongkir + biayaLain, 0);

    const chooseProduct = (rowId: string, productId: string) => {
        const product = products.find((item) => String(item.id) === productId);
        setItems((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          produkId: productId,
                          deskripsi: product?.nama ?? row.deskripsi,
                          satuan: product?.satuan ?? row.satuan,
                          harga: product?.hargaBeli ?? row.harga,
                      }
                    : row,
            ),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/po', { preserveScroll: true });
    };

    if (showSkeleton)
        return (
            <>
                <Head title="Purchase Order" />
                <PurchaseOrderSkeleton />
            </>
        );

    return (
        <>
            <Head title="Purchase Order" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Purchase Order
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Buat permintaan pembelian ke vendor, pantau status
                        pengiriman, dan catat penerimaan barang.
                    </p>
                </div>

                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="size-5" />
                                Daftar Purchase Order
                            </CardTitle>
                            <CardDescription>
                                Filter status dan cari berdasarkan vendor atau
                                nomor PO.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    'ALL',
                                    'DRAFT',
                                    'DIKIRIM',
                                    'DITERIMA',
                                    'DIBATALKAN',
                                ] as const
                            ).map((item) => (
                                <Button
                                    key={item}
                                    type="button"
                                    variant={
                                        status === item ? 'default' : 'outline'
                                    }
                                    onClick={() => setStatus(item)}
                                >
                                    {item === 'ALL' ? 'Semua' : item}
                                </Button>
                            ))}
                            <Input
                                className="w-60"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Cari vendor / nomor PO..."
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[780px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Nomor PO</th>
                                        <th className="px-3 py-2">Vendor</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">
                                            Exp. Terima
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Total
                                        </th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((po) => (
                                        <tr key={po.id} className="border-t">
                                            <td className="px-3 py-2 font-mono font-semibold">
                                                {po.nomor}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {po.vendor}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {po.tanggal}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {po.expectedDate || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {rupiah(po.total)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                                                    {po.status}
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
                                <FileText className="size-5" />
                                Buat Purchase Order Baru
                            </CardTitle>
                            <CardDescription>
                                Isi informasi PO, vendor, item, dan ringkasan
                                total.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card className="border-border/70 bg-muted/30">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Info Purchase Order
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                        <Field
                                            label="Nomor PO"
                                            hint="Kosongkan untuk auto-generate."
                                        >
                                            <Input
                                                name="nomor"
                                                placeholder={nextNumber}
                                            />
                                        </Field>
                                        <Field label="Tanggal PO">
                                            <Input
                                                type="date"
                                                name="tanggal"
                                                defaultValue={today}
                                                max={today}
                                            />
                                        </Field>
                                        <Field label="Estimasi Tanggal Terima">
                                            <Input
                                                type="date"
                                                name="expected_date"
                                            />
                                        </Field>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 bg-muted/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Truck className="size-5" />
                                            Info Vendor / Supplier
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <Field label="Nama Vendor">
                                            <Input
                                                name="vendor"
                                                list="vendor-list"
                                                placeholder="Nama vendor / supplier"
                                            />
                                            <datalist id="vendor-list">
                                                {vendors.map((vendor) => (
                                                    <option
                                                        key={vendor.nama}
                                                        value={vendor.nama}
                                                    >
                                                        {vendor.kontak ||
                                                            vendor.alamat}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </Field>
                                        <Field label="Alamat Vendor">
                                            <Input
                                                name="alamat_vendor"
                                                placeholder="Alamat vendor"
                                            />
                                        </Field>
                                        <Field label="Kontak Vendor">
                                            <Input
                                                name="telepon_vendor"
                                                placeholder="No HP / WA / email / PIC"
                                            />
                                        </Field>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label>Item yang Dipesan</Label>
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
                                        Tambah Baris
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[920px] text-sm">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left">
                                                <th className="px-3 py-2">
                                                    Produk
                                                </th>
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
                                                        <select
                                                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                                            value={row.produkId}
                                                            onChange={(event) =>
                                                                chooseProduct(
                                                                    row.id,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Non-SKU / Manual
                                                            </option>
                                                            {products.map(
                                                                (product) => (
                                                                    <option
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={
                                                                            product.id
                                                                        }
                                                                    >
                                                                        {
                                                                            product.nama
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </td>
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
                                                            placeholder="Nama barang / jasa"
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
                                <Field label="Catatan">
                                    <Textarea
                                        name="catatan"
                                        rows={5}
                                        placeholder="Catatan pengiriman, spesifikasi, syarat, dll."
                                    />
                                </Field>
                                <Card className="border-border/70 bg-muted/30">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Ringkasan Total
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 text-sm">
                                        <Field label="Diskon">
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
                                        <div className="grid gap-1 border-t pt-3">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <strong>
                                                    {rupiah(itemsTotal)}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Diskon</span>
                                                <span>{rupiah(diskon)}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Ongkir + Biaya</span>
                                                <span>
                                                    {rupiah(ongkir + biayaLain)}
                                                </span>
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
                                    Buat Purchase Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function PurchaseOrderSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-md" />
            <Skeleton className="h-[620px] w-full rounded-md" />
        </div>
    );
}
