import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2,
    Clock3,
    HandHeart,
    Landmark,
    Save,
    Scale,
    Wallet,
} from 'lucide-react';
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

type Account = {
    kode: string;
    nama: string;
};

type FundingHistory = {
    id: number;
    tanggal: string;
    keterangan: string;
    pihak: string | null;
    sumber: 'modal' | 'hutang';
    nominal: number;
};

type FundingSource = 'modal' | 'hutang';

type PendanaanProps = {
    today: string;
    akunKas: Account[];
    akunHutang: Account[];
    riwayat: FundingHistory[];
};

const sourceOptions: Array<{
    value: FundingSource;
    label: string;
    description: string;
    icon: ReactNode;
}> = [
    {
        value: 'modal',
        label: 'Setoran Modal Pemilik',
        description: 'Kas bertambah dan ekuitas modal pemilik bertambah.',
        icon: <HandHeart className="size-5" />,
    },
    {
        value: 'hutang',
        label: 'Pinjaman / Hutang',
        description: 'Kas bertambah dan liabilitas pinjaman bertambah.',
        icon: <Landmark className="size-5" />,
    },
];

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
    children: ReactNode;
    hint?: ReactNode;
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

export default function Pendanaan({
    today,
    akunKas,
    akunHutang,
    riwayat,
}: PendanaanProps) {
    const [sumber, setSumber] = useState<FundingSource>('modal');
    const [akunKasCode, setAkunKasCode] = useState(akunKas[0]?.kode ?? '');
    const [akunHutangCode, setAkunHutangCode] = useState('2200');
    const [nominal, setNominal] = useState(0);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const selectedKas = akunKas.find((account) => account.kode === akunKasCode);
    const selectedHutang = akunHutang.find(
        (account) => account.kode === akunHutangCode,
    );
    const currentSource =
        sourceOptions.find((option) => option.value === sumber) ??
        sourceOptions[0];

    const journalRows = useMemo(() => {
        if (nominal <= 0) {
            return [];
        }

        return [
            {
                account: accountLabel(selectedKas) || 'Kas/Bank',
                debit: nominal,
                credit: 0,
                impact: 'Kas/bank bertambah',
            },
            {
                account:
                    sumber === 'modal'
                        ? '3100 - Modal Pemilik'
                        : accountLabel(selectedHutang) ||
                          '2200 - Hutang Bank / Pinjaman',
                debit: 0,
                credit: nominal,
                impact:
                    sumber === 'modal'
                        ? 'Ekuitas pemilik bertambah, bukan pendapatan'
                        : 'Liabilitas pinjaman bertambah, bukan pendapatan',
            },
        ];
    }, [nominal, selectedHutang, selectedKas, sumber]);

    const totals = journalRows.reduce(
        (sum, row) => ({
            debit: sum.debit + row.debit,
            credit: sum.credit + row.credit,
        }),
        { debit: 0, credit: 0 },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/pendanaan', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Pendanaan" />
                <PendanaanSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Pendanaan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Pendanaan
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Catat setoran modal pemilik atau pinjaman yang menambah
                        kas usaha tanpa dihitung sebagai pendapatan.
                    </p>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="size-5" />
                                {currentSource.label}
                            </CardTitle>
                            <CardDescription>
                                {currentSource.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <section className="grid gap-3">
                                <Label>Sumber Pendanaan</Label>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {sourceOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setSumber(option.value)
                                            }
                                            className={`flex min-h-24 items-start gap-3 rounded-md border p-3 text-left text-sm transition ${
                                                sumber === option.value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'bg-background hover:bg-muted/60'
                                            }`}
                                        >
                                            <span className="mt-0.5">
                                                {option.icon}
                                            </span>
                                            <span>
                                                <span className="block font-semibold">
                                                    {option.label}
                                                </span>
                                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <input
                                    type="hidden"
                                    name="sumber"
                                    value={sumber}
                                />
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        required
                                    />
                                </Field>
                                <Field label="Dana Masuk ke Rekening">
                                    <NativeSelect
                                        name="akun_kas"
                                        value={akunKasCode}
                                        onChange={(event) =>
                                            setAkunKasCode(event.target.value)
                                        }
                                    >
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
                                <Field label="Nominal" required>
                                    <MoneyInput
                                        name="nominal"
                                        value={nominal || ''}
                                        onChange={(event) =>
                                            setNominal(
                                                numberValue(event.target.value),
                                            )
                                        }
                                        required
                                        placeholder="0"
                                    />
                                </Field>
                                <Field label="Keterangan">
                                    <Input
                                        name="keterangan"
                                        placeholder="Opsional, mis: Tambahan modal kerja"
                                    />
                                </Field>
                            </section>

                            {sumber === 'hutang' && (
                                <section className="grid gap-4 rounded-md border bg-muted/30 p-4 md:grid-cols-3">
                                    <div className="md:col-span-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Building2 className="size-5" />
                                            Detail Pinjaman
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Pinjaman akan masuk ke tracker
                                            hutang untuk dilunasi pada menu
                                            Pelunasan.
                                        </p>
                                    </div>
                                    <Field label="Jenis Liabilitas">
                                        <NativeSelect
                                            name="akun_hutang"
                                            value={akunHutangCode}
                                            onChange={(event) =>
                                                setAkunHutangCode(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {akunHutang.map((account) => (
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
                                    <Field label="Pemberi Pinjaman / Kreditur">
                                        <Input
                                            name="kreditur"
                                            placeholder="Mis: Bank BRI, Koperasi, Investor A"
                                        />
                                    </Field>
                                    <Field label="Jatuh Tempo">
                                        <Input type="date" name="jatuh_tempo" />
                                    </Field>
                                </section>
                            )}

                            <JournalPreview
                                rows={journalRows}
                                totals={totals}
                                sumber={sumber}
                            />

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Catat Pendanaan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <FundingHistoryTable riwayat={riwayat} />
            </div>
        </>
    );
}

function JournalPreview({
    rows,
    totals,
    sumber,
}: {
    rows: Array<{
        account: string;
        debit: number;
        credit: number;
        impact: string;
    }>;
    totals: { debit: number; credit: number };
    sumber: FundingSource;
}) {
    return (
        <section className="grid gap-3 rounded-md border p-4">
            <CardTitle className="flex items-center gap-2 text-sm">
                <Scale className="size-5" />
                Pratinjau Jurnal Neraca
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
                                    Isi nominal untuk melihat preview jurnal.
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
                {sumber === 'modal'
                    ? 'Setoran modal menambah kas dan ekuitas. Transaksi ini tidak dihitung sebagai pendapatan.'
                    : 'Pinjaman menambah kas dan liabilitas. Transaksi ini masuk tracker hutang dan bukan pendapatan.'}
            </p>
        </section>
    );
}

function FundingHistoryTable({ riwayat }: { riwayat: FundingHistory[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="size-5" />
                    Riwayat Pendanaan
                </CardTitle>
                <CardDescription>
                    Pendanaan yang sudah tercatat lewat menu ini.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-muted/60">
                            <tr className="text-left">
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Keterangan</th>
                                <th className="px-3 py-2">Sumber</th>
                                <th className="px-3 py-2 text-right">
                                    Nominal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-3 py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada pendanaan tercatat lewat menu
                                        ini.
                                    </td>
                                </tr>
                            ) : (
                                riwayat.map((row) => (
                                    <tr key={row.id} className="border-t">
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {row.tanggal}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="font-medium">
                                                {row.keterangan}
                                            </div>
                                            {row.pihak && (
                                                <div className="text-xs text-muted-foreground">
                                                    {row.pihak}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
                                                {row.sumber === 'modal'
                                                    ? 'Modal'
                                                    : 'Pinjaman'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {rupiah(row.nominal)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function PendanaanSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-2 md:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-24 w-full rounded-md"
                            />
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="grid gap-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-40 w-full rounded-md" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-72 w-full rounded-md" />
        </div>
    );
}
