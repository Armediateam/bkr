import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Account = {
    id: number;
    kode: string;
    nama: string;
    tipe: string;
};

type Journal = {
    id: number;
    nomor: string;
    tanggal: string;
    keterangan: string;
    referensi: string;
    kategori: 'OPERASIONAL' | 'INVESTASI' | 'PENDANAAN';
    jumlah: number;
    source: string;
    cashier: string | null;
};

type JournalLine = {
    id: number;
    accountId: number;
    debit: number;
    kredit: number;
};

type Props = {
    today: string;
    accounts: Account[];
    journals: Journal[];
};

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
    required = false,
}: {
    label: string;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label>
                {label} {required && <span className="text-red-600">*</span>}
            </Label>
            {children}
        </div>
    );
}

export default function JournalTransactions({
    today,
    accounts,
    journals,
}: Props) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<
        'SEMUA' | 'OPERASIONAL' | 'INVESTASI' | 'PENDANAAN'
    >('SEMUA');
    const [lines, setLines] = useState<JournalLine[]>([
        { id: 1, accountId: accounts[0]?.id ?? 0, debit: 0, kredit: 0 },
        {
            id: 2,
            accountId: accounts[6]?.id ?? accounts[0]?.id ?? 0,
            debit: 0,
            kredit: 0,
        },
    ]);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return journals
            .filter((journal) =>
                category === 'SEMUA' ? true : journal.kategori === category,
            )
            .filter((journal) =>
                [
                    journal.nomor,
                    journal.keterangan,
                    journal.referensi,
                    journal.source,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(term),
            );
    }, [category, journals, query]);

    const totals = lines.reduce(
        (sum, line) => ({
            debit: sum.debit + line.debit,
            kredit: sum.kredit + line.kredit,
        }),
        { debit: 0, kredit: 0 },
    );
    const balanced = totals.debit > 0 && totals.debit === totals.kredit;

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/transaksi', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Jurnal Transaksi" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Jurnal Transaksi" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Jurnal Transaksi
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola jurnal double-entry, kategori arus kas, dan
                            referensi transaksi manual.
                        </p>
                    </div>
                    <JournalDialog
                        today={today}
                        accounts={accounts}
                        lines={lines}
                        setLines={setLines}
                        totals={totals}
                        balanced={balanced}
                        processing={processing}
                        onSubmit={submit}
                    />
                </div>

                <Card className="border-border/70">
                    <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_auto]">
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                className="pl-8"
                                placeholder="Cari ID / keterangan / referensi..."
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(event) =>
                                setCategory(
                                    event.target.value as
                                        | 'SEMUA'
                                        | 'OPERASIONAL'
                                        | 'INVESTASI'
                                        | 'PENDANAAN',
                                )
                            }
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="SEMUA">Semua Kategori</option>
                            <option value="OPERASIONAL">Operasional</option>
                            <option value="INVESTASI">Investasi</option>
                            <option value="PENDANAAN">Pendanaan</option>
                        </select>
                        <Button variant="outline">Cari</Button>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="size-5" />
                            Daftar Jurnal
                        </CardTitle>
                        <CardDescription>
                            Jumlah menampilkan total sisi debit transaksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[920px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">
                                            ID Transaksi
                                        </th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">
                                            Keterangan
                                        </th>
                                        <th className="px-3 py-2">Kategori</th>
                                        <th className="px-3 py-2">Sumber</th>
                                        <th className="px-3 py-2 text-right">
                                            Jumlah (Debit)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((journal) => (
                                        <tr
                                            key={journal.id}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-3 font-mono text-xs">
                                                {journal.nomor}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {journal.tanggal}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {journal.keterangan}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Ref: {journal.referensi}
                                                    {journal.cashier &&
                                                        ` · ${journal.cashier}`}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant="outline">
                                                    {journal.kategori}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                {journal.source === 'POS' ? (
                                                    <Badge>POS</Badge>
                                                ) : (
                                                    journal.source
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {rupiah(journal.jumlah)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function JournalDialog({
    today,
    accounts,
    lines,
    setLines,
    totals,
    balanced,
    processing,
    onSubmit,
}: {
    today: string;
    accounts: Account[];
    lines: JournalLine[];
    setLines: React.Dispatch<React.SetStateAction<JournalLine[]>>;
    totals: { debit: number; kredit: number };
    balanced: boolean;
    processing: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    Transaksi Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Transaksi Baru</DialogTitle>
                        <DialogDescription>
                            Debit dan kredit harus seimbang sebelum jurnal
                            disimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Field label="Tanggal" required>
                                <Input
                                    type="date"
                                    name="tanggal"
                                    defaultValue={today}
                                    required
                                />
                            </Field>
                            <Field label="Keterangan" required>
                                <Input
                                    name="keterangan"
                                    placeholder="Deskripsi transaksi..."
                                    required
                                />
                            </Field>
                            <Field label="No. Referensi">
                                <Input name="referensi" placeholder="INV-001" />
                            </Field>
                            <Field label="Kategori Arus Kas">
                                <select
                                    name="kategori"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="OPERASIONAL">
                                        Operasional
                                    </option>
                                    <option value="INVESTASI">Investasi</option>
                                    <option value="PENDANAAN">Pendanaan</option>
                                </select>
                            </Field>
                        </div>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Akun</th>
                                        <th className="px-3 py-2 text-right">
                                            Debit
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Kredit
                                        </th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line) => (
                                        <tr key={line.id} className="border-t">
                                            <td className="px-3 py-2">
                                                <select
                                                    name="akun_id[]"
                                                    value={line.accountId}
                                                    onChange={(event) =>
                                                        setLines((rows) =>
                                                            rows.map((row) =>
                                                                row.id ===
                                                                line.id
                                                                    ? {
                                                                          ...row,
                                                                          accountId:
                                                                              Number(
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                              ),
                                                                      }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    {accounts.map((account) => (
                                                        <option
                                                            key={account.id}
                                                            value={account.id}
                                                        >
                                                            {account.kode} -{' '}
                                                            {account.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    name="debit[]"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={line.debit || ''}
                                                    onChange={(event) =>
                                                        setLines((rows) =>
                                                            rows.map((row) =>
                                                                row.id ===
                                                                line.id
                                                                    ? {
                                                                          ...row,
                                                                          debit:
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
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    name="kredit[]"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={line.kredit || ''}
                                                    onChange={(event) =>
                                                        setLines((rows) =>
                                                            rows.map((row) =>
                                                                row.id ===
                                                                line.id
                                                                    ? {
                                                                          ...row,
                                                                          kredit:
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
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setLines((rows) =>
                                                            rows.filter(
                                                                (row) =>
                                                                    row.id !==
                                                                    line.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t bg-muted/30">
                                    <tr>
                                        <td className="px-3 py-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setLines((rows) => [
                                                        ...rows,
                                                        {
                                                            id: Date.now(),
                                                            accountId:
                                                                accounts[0]
                                                                    ?.id ?? 0,
                                                            debit: 0,
                                                            kredit: 0,
                                                        },
                                                    ])
                                                }
                                            >
                                                <Plus className="size-4" />
                                                Tambah Baris
                                            </Button>
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold">
                                            {rupiah(totals.debit)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold">
                                            {rupiah(totals.kredit)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div
                            className={`rounded-md border p-3 text-sm ${
                                balanced
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-amber-200 bg-amber-50 text-amber-800'
                            }`}
                        >
                            {balanced
                                ? 'Debit dan kredit sudah seimbang.'
                                : 'Debit dan kredit belum seimbang.'}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={processing || !balanced}
                        >
                            <Save className="size-4" />
                            Simpan Transaksi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-20 rounded-md" />
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
