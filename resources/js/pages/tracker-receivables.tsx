import { Head, useForm } from '@inertiajs/react';
import { Ban, CalendarClock, CircleDollarSign, Search } from 'lucide-react';
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type CashAccount = { kode: string; nama: string };
type Row = {
    id: number;
    tanggal: string;
    customer: string;
    keterangan: string;
    jumlah: number;
    terbayar: number;
    jatuhTempo: string;
    status: string;
};

type Props = {
    today: string;
    cashAccounts: CashAccount[];
    rows: Row[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

function daysUntil(date: string, today: string): number {
    const start = new Date(`${today}T00:00:00`).getTime();
    const end = new Date(`${date}T00:00:00`).getTime();
    return Math.round((end - start) / 86400000);
}

export default function TrackerReceivables({
    today,
    cashAccounts,
    rows,
}: Props) {
    const [status, setStatus] = useState<'ALL' | 'BELUM LUNAS' | 'LUNAS'>(
        'BELUM LUNAS',
    );
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Row | null>(null);
    const [writeOffSelected, setWriteOffSelected] = useState<Row | null>(null);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return rows
            .filter((row) => (status === 'ALL' ? true : row.status === status))
            .filter((row) =>
                [row.customer, row.keterangan]
                    .join(' ')
                    .toLowerCase()
                    .includes(term),
            );
    }, [query, rows, status]);

    const active = rows.filter((row) => row.status !== 'LUNAS');
    const kpi = active.reduce(
        (sum, row) => {
            const sisa = row.jumlah - row.terbayar;
            const diff = daysUntil(row.jatuhTempo, today);
            return {
                total: sum.total + sisa,
                overdue: sum.overdue + (diff < 0 ? sisa : 0),
                soon: sum.soon + (diff >= 0 && diff <= 7 ? sisa : 0),
            };
        },
        { total: 0, overdue: 0, soon: 0 },
    );

    const pay = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/piutang/bayar', { preserveScroll: true });
    };

    const writeOff = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/piutang/write-off', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Tracker Piutang" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Tracker Piutang" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Header
                    title="Tracker Piutang"
                    description="Piutang otomatis tercatat saat input Pemasukan kredit atau invoice belum lunas."
                    query={query}
                    setQuery={setQuery}
                    status={status}
                    setStatus={setStatus}
                />
                <Kpis
                    total={kpi.total}
                    overdue={kpi.overdue}
                    soon={kpi.soon}
                    labels={[
                        'Total Piutang Aktif',
                        'Lewat Jatuh Tempo',
                        'Mendekati Jatuh Tempo',
                    ]}
                />
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Daftar Piutang
                        </CardTitle>
                        <CardDescription>
                            Sisa piutang = jumlah tagihan dikurangi pembayaran.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DebtTable
                            rows={filtered}
                            today={today}
                            partyLabel="Customer"
                            partyKey="customer"
                            onSelect={setSelected}
                            onWriteOff={setWriteOffSelected}
                            receivable
                        />
                    </CardContent>
                </Card>
                <PaymentDialog
                    selected={selected}
                    setSelected={setSelected}
                    today={today}
                    cashAccounts={cashAccounts}
                    title="Bayar Piutang"
                    accountLabel="Diterima ke Akun"
                    processing={processing}
                    onSubmit={pay}
                />
                <Dialog
                    open={Boolean(writeOffSelected)}
                    onOpenChange={(open) => !open && setWriteOffSelected(null)}
                >
                    <DialogContent>
                        {writeOffSelected && (
                            <form onSubmit={writeOff}>
                                <DialogHeader>
                                    <DialogTitle>Write Off Piutang</DialogTitle>
                                    <DialogDescription>
                                        Hapus sisa piutang dari neraca dan catat
                                        sebagai kerugian piutang.
                                    </DialogDescription>
                                </DialogHeader>
                                <input
                                    name="id"
                                    type="hidden"
                                    value={writeOffSelected.id}
                                />
                                <div className="grid gap-4 py-4">
                                    <Field label="Tanggal">
                                        <Input
                                            type="date"
                                            name="tanggal"
                                            defaultValue={today}
                                        />
                                    </Field>
                                    <Field label="Jumlah Write Off">
                                        <Input
                                            type="number"
                                            name="jumlah"
                                            min="0.01"
                                            step="0.01"
                                            defaultValue={
                                                writeOffSelected.jumlah -
                                                writeOffSelected.terbayar
                                            }
                                        />
                                    </Field>
                                    <Field label="Alasan">
                                        <Input
                                            name="alasan"
                                            placeholder="Mis: tidak tertagih"
                                        />
                                    </Field>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" variant="destructive">
                                        <Ban className="size-4" />
                                        Catat Write Off
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

function Header({
    title,
    description,
    query,
    setQuery,
    status,
    setStatus,
}: {
    title: string;
    description: string;
    query: string;
    setQuery: (value: string) => void;
    status: 'ALL' | 'BELUM LUNAS' | 'LUNAS';
    setStatus: (value: 'ALL' | 'BELUM LUNAS' | 'LUNAS') => void;
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex gap-2">
                    {(['BELUM LUNAS', 'ALL', 'LUNAS'] as const).map((item) => (
                        <Button
                            key={item}
                            type="button"
                            variant={status === item ? 'default' : 'outline'}
                            onClick={() => setStatus(item)}
                        >
                            {item === 'ALL' ? 'Semua' : item}
                        </Button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="pl-8 sm:w-64"
                        placeholder="Cari pelanggan..."
                    />
                </div>
            </div>
        </div>
    );
}

function Kpis({
    total,
    overdue,
    soon,
    labels,
}: {
    total: number;
    overdue: number;
    soon: number;
    labels: string[];
}) {
    return (
        <section className="grid gap-3 md:grid-cols-3">
            {[total, overdue, soon].map((value, index) => (
                <Card key={labels[index]} className="border-border/70">
                    <CardContent className="flex min-h-24 items-start justify-between p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {labels[index]}
                            </p>
                            <p className="mt-2 text-xl font-semibold">
                                {rupiah(value)}
                            </p>
                        </div>
                        {index === 0 ? (
                            <CircleDollarSign className="size-5 text-muted-foreground" />
                        ) : (
                            <CalendarClock className="size-5 text-muted-foreground" />
                        )}
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

function DebtTable({
    rows,
    today,
    partyLabel,
    partyKey,
    onSelect,
    onWriteOff,
}: {
    rows: Row[];
    today: string;
    partyLabel: string;
    partyKey: 'customer';
    onSelect: (row: Row) => void;
    onWriteOff: (row: Row) => void;
    receivable?: boolean;
}) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-muted/60">
                    <tr className="text-left">
                        <th className="px-3 py-2">Tanggal</th>
                        <th className="px-3 py-2">{partyLabel}</th>
                        <th className="px-3 py-2">Keterangan</th>
                        <th className="px-3 py-2">Jatuh Tempo</th>
                        <th className="px-3 py-2 text-right">Jumlah</th>
                        <th className="px-3 py-2 text-right">Terbayar</th>
                        <th className="px-3 py-2 text-right">Sisa</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const sisa = row.jumlah - row.terbayar;
                        const diff = daysUntil(row.jatuhTempo, today);
                        const overdue = row.status !== 'LUNAS' && diff < 0;

                        return (
                            <tr key={row.id} className="border-t">
                                <td className="px-3 py-3 text-muted-foreground">
                                    {row.tanggal}
                                </td>
                                <td className="px-3 py-3 font-medium">
                                    {row[partyKey]}
                                </td>
                                <td className="px-3 py-3">{row.keterangan}</td>
                                <td className="px-3 py-3">
                                    <span
                                        className={
                                            overdue
                                                ? 'font-semibold text-red-600'
                                                : ''
                                        }
                                    >
                                        {row.jatuhTempo}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {rupiah(row.jumlah)}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {rupiah(row.terbayar)}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold">
                                    {rupiah(sisa)}
                                </td>
                                <td className="px-3 py-3">
                                    <Badge
                                        variant={
                                            row.status === 'LUNAS'
                                                ? 'secondary'
                                                : overdue
                                                  ? 'destructive'
                                                  : 'outline'
                                        }
                                    >
                                        {row.status === 'LUNAS'
                                            ? 'Lunas'
                                            : overdue
                                              ? 'Lewat J.T.'
                                              : 'Belum Lunas'}
                                    </Badge>
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {row.status !== 'LUNAS' && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onSelect(row)}
                                            >
                                                Bayar
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onWriteOff(row)}
                                            >
                                                Write Off
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function PaymentDialog({
    selected,
    setSelected,
    today,
    cashAccounts,
    title,
    accountLabel,
    processing,
    onSubmit,
}: {
    selected: Row | null;
    setSelected: (row: Row | null) => void;
    today: string;
    cashAccounts: CashAccount[];
    title: string;
    accountLabel: string;
    processing: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <Dialog
            open={Boolean(selected)}
            onOpenChange={(open) => !open && setSelected(null)}
        >
            <DialogContent>
                {selected && (
                    <form onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>
                                Sisa tagihan{' '}
                                {rupiah(selected.jumlah - selected.terbayar)}.
                            </DialogDescription>
                        </DialogHeader>
                        <input name="id" type="hidden" value={selected.id} />
                        <div className="grid gap-4 py-4">
                            <Field label="Tanggal">
                                <Input
                                    type="date"
                                    name="tanggal"
                                    defaultValue={today}
                                />
                            </Field>
                            <Field label={accountLabel}>
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
                            <Field label="Jumlah Pembayaran">
                                <Input
                                    type="number"
                                    name="jumlah"
                                    min="0.01"
                                    step="0.01"
                                    defaultValue={
                                        selected.jumlah - selected.terbayar
                                    }
                                />
                            </Field>
                            <Field label="Catatan">
                                <Input name="catatan" />
                            </Field>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={processing}>
                                Catat Pembayaran
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
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
            <div className="grid gap-3 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
