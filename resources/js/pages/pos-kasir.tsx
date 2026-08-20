import { Head, Link, useForm } from '@inertiajs/react';
import {
    Banknote,
    Minus,
    Package,
    Pause,
    Plus,
    Receipt,
    Search,
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

type Product = {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    satuan: string;
    harga: number;
    stok: number;
    favorit: boolean;
};

type Voucher = {
    kode: string;
    nama: string;
    nominal: number;
};

type CartLine = Product & {
    qty: number;
};

type PosKasirProps = {
    shiftOpen: boolean;
    cashier: string;
    categories: string[];
    products: Product[];
    vouchers: Voucher[];
};

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

export default function PosKasir({
    shiftOpen,
    cashier,
    categories,
    products,
    vouchers,
}: PosKasirProps) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Semua');
    const [cart, setCart] = useState<CartLine[]>([]);
    const [customer, setCustomer] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [heldOrders, setHeldOrders] = useState<CartLine[][]>([]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            category === 'Semua' ||
            product.kategori === category ||
            (category === 'Favorit' && product.favorit);
        const matchesQuery = [product.nama, product.kode, product.kategori]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    const subtotal = cart.reduce((sum, line) => sum + line.qty * line.harga, 0);
    const voucher = vouchers.find((item) => item.kode === voucherCode);
    const voucherDiscount = voucher?.nominal ?? 0;
    const total = Math.max(subtotal - discount - voucherDiscount, 0);

    const addProduct = (product: Product) => {
        if (product.stok <= 0) {
            return;
        }

        setCart((lines) => {
            const existing = lines.find((line) => line.id === product.id);
            if (existing) {
                return lines.map((line) =>
                    line.id === product.id
                        ? { ...line, qty: line.qty + 1 }
                        : line,
                );
            }

            return [...lines, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart((lines) =>
            lines
                .map((line) =>
                    line.id === id
                        ? { ...line, qty: Math.max(line.qty + delta, 0) }
                        : line,
                )
                .filter((line) => line.qty > 0),
        );
    };

    const holdOrder = () => {
        if (cart.length === 0) {
            return;
        }

        setHeldOrders((orders) => [...orders, cart]);
        setCart([]);
        setCustomer('');
        setDiscount(0);
        setVoucherCode('');
    };

    const submit = () => {
        post('/dashboard/pos', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="POS Kasir" />
                <PosSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="POS Kasir" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            POS Kasir
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kasir: {cashier}. Tambah produk ke keranjang, tahan
                            order, beri diskon/voucher, lalu proses pembayaran.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={shiftOpen ? 'outline' : 'default'}>
                            {shiftOpen ? 'Tutup Shift' : 'Buka Shift'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/pos/master">Master POS</Link>
                        </Button>
                    </div>
                </div>

                {!shiftOpen ? (
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Shift Belum Dibuka</CardTitle>
                            <CardDescription>
                                Buka shift dan catat saldo awal kas sebelum
                                mulai transaksi.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                        <section className="grid gap-4">
                            <Card className="border-border/70">
                                <CardContent className="grid gap-4 pt-6">
                                    <div className="flex items-center gap-2 rounded-md border px-3">
                                        <Search className="size-4 text-muted-foreground" />
                                        <Input
                                            value={query}
                                            onChange={(event) =>
                                                setQuery(event.target.value)
                                            }
                                            placeholder="Cari produk berdasarkan nama atau kode..."
                                            className="border-0 shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={
                                                category === 'Favorit'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setCategory('Favorit')
                                            }
                                        >
                                            Favorit
                                        </Button>
                                        {categories.map((item) => (
                                            <Button
                                                key={item}
                                                type="button"
                                                variant={
                                                    category === item
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setCategory(item)
                                                }
                                            >
                                                {item}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => addProduct(product)}
                                        disabled={product.stok <= 0}
                                        className="rounded-md border bg-background p-4 text-left transition hover:bg-muted/50 disabled:opacity-50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="rounded-md bg-muted p-2">
                                                <Package className="size-5" />
                                            </div>
                                            {product.favorit && (
                                                <span className="rounded-full border px-2 py-0.5 text-xs">
                                                    Favorit
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {product.kode}
                                            </div>
                                            <div className="mt-1 font-semibold">
                                                {product.nama}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {product.kategori} - stok{' '}
                                                {product.stok} {product.satuan}
                                            </div>
                                            <div className="mt-4 text-xl font-semibold">
                                                {rupiah(product.harga)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Receipt className="size-5" />
                                    Order Aktif
                                </CardTitle>
                                <CardDescription>
                                    {cart.length} item dalam keranjang.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Customer</Label>
                                    <Input
                                        value={customer}
                                        onChange={(event) =>
                                            setCustomer(event.target.value)
                                        }
                                        placeholder="Nama customer"
                                    />
                                </div>

                                <div className="max-h-[360px] overflow-auto rounded-md border">
                                    {cart.length === 0 ? (
                                        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                            Keranjang masih kosong.
                                        </div>
                                    ) : (
                                        cart.map((line) => (
                                            <div
                                                key={line.id}
                                                className="grid gap-3 border-b p-3 last:border-b-0"
                                            >
                                                <div className="flex justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">
                                                            {line.nama}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {line.qty} x{' '}
                                                            {rupiah(line.harga)}
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold">
                                                        {rupiah(
                                                            line.qty *
                                                                line.harga,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            updateQty(
                                                                line.id,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <Minus className="size-4" />
                                                    </Button>
                                                    <span className="w-8 text-center font-semibold">
                                                        {line.qty}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            updateQty(
                                                                line.id,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-auto"
                                                        onClick={() =>
                                                            setCart((lines) =>
                                                                lines.filter(
                                                                    (item) =>
                                                                        item.id !==
                                                                        line.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label>Diskon Manual</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={discount || ''}
                                            onChange={(event) =>
                                                setDiscount(
                                                    numberValue(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Voucher</Label>
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={voucherCode}
                                            onChange={(event) =>
                                                setVoucherCode(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Tanpa voucher
                                            </option>
                                            {vouchers.map((item) => (
                                                <option
                                                    key={item.kode}
                                                    value={item.kode}
                                                >
                                                    {item.nama} -{' '}
                                                    {rupiah(item.nominal)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-2 rounded-md border bg-muted/30 p-4 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <strong>{rupiah(subtotal)}</strong>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Diskon</span>
                                        <span>
                                            {rupiah(discount + voucherDiscount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{rupiah(total)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={holdOrder}
                                        disabled={cart.length === 0}
                                    >
                                        <Pause className="size-4" />
                                        Hold{' '}
                                        {heldOrders.length > 0 &&
                                            `(${heldOrders.length})`}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={submit}
                                        disabled={
                                            processing || cart.length === 0
                                        }
                                    >
                                        <Banknote className="size-4" />
                                        Bayar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

function PosSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="grid gap-4">
                    <Skeleton className="h-32 w-full rounded-md" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-56 w-full rounded-md"
                            />
                        ))}
                    </div>
                </div>
                <Skeleton className="h-[640px] w-full rounded-md" />
            </div>
        </div>
    );
}
