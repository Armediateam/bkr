import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRightLeft,
    Banknote,
    Clock3,
    HelpCircle,
    Save,
    Scale,
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
    saldo: number;
};

type TransferHistory = {
    id: number;
    tanggal: string;
    rekeningAsal: string;
    rekeningTujuan: string;
    nominal: number;
    biayaAdmin: number;
    nomorTx: string;
};

type TransferRekeningProps = {
    today: string;
    rekening: Account[];
    riwayat: TransferHistory[];
};

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

export default function TransferRekening({
    today,
    rekening,
    riwayat,
}: TransferRekeningProps) {
    const [akunAsal, setAkunAsal] = useState('');
    const [akunTujuan, setAkunTujuan] = useState('');
    const [nominal, setNominal] = useState(0);
    const [biayaAdmin, setBiayaAdmin] = useState(0);
    const [showHelp, setShowHelp] = useState(false);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const asal = rekening.find((account) => account.kode === akunAsal);
    const tujuan = rekening.find((account) => account.kode === akunTujuan);
    const sameAccount = Boolean(
        akunAsal && akunTujuan && akunAsal === akunTujuan,
    );
    const totalKeluar = nominal + biayaAdmin;

    const journalRows = useMemo(() => {
        if (nominal <= 0) {
            return [];
        }

        const rows = [
            {
                account: accountLabel(tujuan) || 'Rekening Tujuan',
                debit: nominal,
                credit: 0,
                impact: 'Saldo rekening tujuan bertambah',
            },
        ];

        if (biayaAdmin > 0) {
            rows.push({
                account: '6150 - Beban Administrasi',
                debit: biayaAdmin,
                credit: 0,
                impact: 'Biaya admin bank dicatat sebagai beban',
            });
        }

        rows.push({
            account: accountLabel(asal) || 'Rekening Asal',
            debit: 0,
            credit: totalKeluar,
            impact: 'Saldo rekening asal berkurang',
        });

        return rows;
    }, [asal, biayaAdmin, nominal, tujuan, totalKeluar]);

    const totals = journalRows.reduce(
        (sum, row) => ({
            debit: sum.debit + row.debit,
            credit: sum.credit + row.credit,
        }),
        { debit: 0, credit: 0 },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sameAccount) {
            return;
        }

        post('/dashboard/transfer-rekening', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Transfer Rekening" />
                <TransferRekeningSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Transfer Rekening" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Transfer Rekening
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Pindahkan dana antar rekening usaha tanpa
                            mencatatnya sebagai pemasukan atau pengeluaran.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowHelp((value) => !value)}
                    >
                        <HelpCircle className="size-4" />
                        Petunjuk
                    </Button>
                </div>

                {showHelp && (
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Petunjuk Transfer
                            </CardTitle>
                            <CardDescription>
                                Transfer murni hanya memindahkan saldo antar
                                akun kas/bank. Biaya admin, jika ada, akan masuk
                                ke beban administrasi.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <Card className="border-border/70 bg-muted/30">
                    <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
                        <Banknote className="mt-0.5 size-5 shrink-0" />
                        <p>
                            Gunakan halaman ini hanya untuk pindah dana antar
                            rekening usaha. Jika ada biaya admin, biaya tersebut
                            dicatat ke{' '}
                            <span className="font-medium text-foreground">
                                6150 - Beban Administrasi
                            </span>
                            .
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ArrowRightLeft className="size-5" />
                                Pindah Dana Antar Rekening
                            </CardTitle>
                            <CardDescription>
                                Pilih rekening asal, rekening tujuan, nominal
                                masuk, dan biaya admin jika ada.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            {rekening.length < 2 ? (
                                <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                                    <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                                    Minimal perlu 2 rekening kas/bank aktif.
                                    Tambahkan rekening di menu Pengaturan.
                                </div>
                            ) : (
                                <>
                                    <section className="grid gap-4 md:grid-cols-3">
                                        <Field label="Tanggal" required>
                                            <Input
                                                type="date"
                                                name="tanggal"
                                                defaultValue={today}
                                                required
                                            />
                                        </Field>
                                        <Field label="Dari Rekening" required>
                                            <NativeSelect
                                                name="akun_asal"
                                                value={akunAsal}
                                                onChange={(event) =>
                                                    setAkunAsal(
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    -- Pilih asal --
                                                </option>
                                                {rekening.map((account) => (
                                                    <option
                                                        key={account.kode}
                                                        value={account.kode}
                                                    >
                                                        {account.kode} -{' '}
                                                        {account.nama} | saldo{' '}
                                                        {rupiah(account.saldo)}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </Field>
                                        <Field label="Ke Rekening" required>
                                            <NativeSelect
                                                name="akun_tujuan"
                                                value={akunTujuan}
                                                onChange={(event) =>
                                                    setAkunTujuan(
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    -- Pilih tujuan --
                                                </option>
                                                {rekening.map((account) => (
                                                    <option
                                                        key={account.kode}
                                                        value={account.kode}
                                                    >
                                                        {account.kode} -{' '}
                                                        {account.nama} | saldo{' '}
                                                        {rupiah(account.saldo)}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </Field>
                                        <Field
                                            label="Nominal Dipindahkan"
                                            required
                                            hint="Nominal yang masuk ke rekening tujuan."
                                        >
                                            <MoneyInput
                                                name="nominal"
                                                value={nominal || ''}
                                                onChange={(event) =>
                                                    setNominal(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                required
                                                placeholder="0"
                                            />
                                        </Field>
                                        <Field
                                            label="Biaya Admin"
                                            hint="Jika ada, total keluar dari rekening asal = nominal + biaya."
                                        >
                                            <MoneyInput
                                                name="biaya_admin"
                                                value={biayaAdmin || ''}
                                                onChange={(event) =>
                                                    setBiayaAdmin(
                                                        numberValue(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        </Field>
                                        <Field label="Keterangan">
                                            <Input
                                                name="keterangan"
                                                placeholder="Mis: TF BCA ke Mandiri"
                                            />
                                        </Field>
                                    </section>

                                    {sameAccount && (
                                        <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm text-red-600">
                                            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                                            Rekening asal dan tujuan tidak boleh
                                            sama.
                                        </div>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Summary
                                            title="Saldo Asal"
                                            value={
                                                asal ? rupiah(asal.saldo) : '-'
                                            }
                                        />
                                        <Summary
                                            title="Total Keluar"
                                            value={rupiah(totalKeluar)}
                                        />
                                        <Summary
                                            title="Saldo Tujuan"
                                            value={
                                                tujuan
                                                    ? rupiah(tujuan.saldo)
                                                    : '-'
                                            }
                                        />
                                    </div>

                                    <JournalPreview
                                        rows={journalRows}
                                        totals={totals}
                                    />

                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="outline">
                                            <Link href="/dashboard">Batal</Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || sameAccount}
                                        >
                                            <Save className="size-4" />
                                            Simpan Transfer
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </form>

                <TransferHistoryTable riwayat={riwayat} />
            </div>
        </>
    );
}

function Summary({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
        </div>
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
                Preview Jurnal
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
                                    Isi rekening dan nominal untuk melihat
                                    preview.
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
        </section>
    );
}

function TransferHistoryTable({ riwayat }: { riwayat: TransferHistory[] }) {
    return (
        <Card className="border-border/70">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock3 className="size-5" />
                        Riwayat Transfer Rekening
                    </CardTitle>
                    <CardDescription>
                        Transfer rekening yang sudah tercatat.
                    </CardDescription>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                    {riwayat.length}
                </span>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-muted/60">
                            <tr className="text-left">
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Dari</th>
                                <th className="px-3 py-2">Ke</th>
                                <th className="px-3 py-2 text-right">
                                    Nominal
                                </th>
                                <th className="px-3 py-2 text-right">Biaya</th>
                                <th className="px-3 py-2">Jurnal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada transfer rekening tercatat.
                                    </td>
                                </tr>
                            ) : (
                                riwayat.map((row) => (
                                    <tr key={row.id} className="border-t">
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {row.tanggal}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.rekeningAsal || '-'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.rekeningTujuan || '-'}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {rupiah(row.nominal)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-muted-foreground">
                                            {rupiah(row.biayaAdmin)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.nomorTx || `#${row.id}`}
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

function TransferRekeningSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
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
                                className="h-24 w-full rounded-md"
                            />
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
