import { Head, Link, useForm } from '@inertiajs/react';
import {
    Banknote,
    CircleDollarSign,
    HandCoins,
    Handshake,
    ReceiptText,
    Save,
    Scale,
    UserRound,
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

type SettlementRecord = {
    id: number | string;
    nama: string;
    keterangan: string;
    sisa: number;
    jatuhTempo: string | null;
};

type SettlementType = 'PIUTANG' | 'HUTANG' | 'PINJAMAN_KARYAWAN';

type PelunasanProps = {
    today: string;
    akunKas: Account[];
    piutangAktif: SettlementRecord[];
    hutangAktif: SettlementRecord[];
    pinjamanAktif: SettlementRecord[];
};

const settlementOptions: Array<{
    value: SettlementType;
    label: string;
    description: string;
    icon: ReactNode;
}> = [
    {
        value: 'PIUTANG',
        label: 'Penerimaan Piutang',
        description: 'Kas/bank bertambah, piutang usaha berkurang.',
        icon: <ReceiptText className="size-5" />,
    },
    {
        value: 'HUTANG',
        label: 'Pembayaran Hutang',
        description: 'Hutang usaha berkurang, kas/bank keluar.',
        icon: <HandCoins className="size-5" />,
    },
    {
        value: 'PINJAMAN_KARYAWAN',
        label: 'Pinjaman Karyawan',
        description: 'Kas/bank bertambah, piutang karyawan berkurang.',
        icon: <UserRound className="size-5" />,
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
                step="0.01"
                className="rounded-l-none"
                {...props}
            />
        </div>
    );
}

export default function Pelunasan({
    today,
    akunKas,
    piutangAktif,
    hutangAktif,
    pinjamanAktif,
}: PelunasanProps) {
    const [jenis, setJenis] = useState<SettlementType>('PIUTANG');
    const [recordId, setRecordId] = useState('');
    const [akunKasCode, setAkunKasCode] = useState(akunKas[0]?.kode ?? '');
    const [nominal, setNominal] = useState(0);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const activeRecords = useMemo(() => {
        if (jenis === 'HUTANG') {
            return hutangAktif;
        }

        if (jenis === 'PINJAMAN_KARYAWAN') {
            return pinjamanAktif;
        }

        return piutangAktif;
    }, [hutangAktif, jenis, pinjamanAktif, piutangAktif]);

    const selectedRecord = activeRecords.find(
        (record) => String(record.id) === recordId,
    );
    const selectedKas = akunKas.find((account) => account.kode === akunKasCode);
    const currentOption =
        settlementOptions.find((option) => option.value === jenis) ??
        settlementOptions[0];

    const journalRows = useMemo(() => {
        if (nominal <= 0) {
            return [];
        }

        if (jenis === 'HUTANG') {
            return [
                {
                    account: '2100 - Hutang Usaha',
                    debit: nominal,
                    credit: 0,
                    impact: 'Hutang usaha berkurang',
                },
                {
                    account: accountLabel(selectedKas) || '1100 - Kas',
                    debit: 0,
                    credit: nominal,
                    impact: 'Kas/bank digunakan untuk membayar hutang',
                },
            ];
        }

        return [
            {
                account: accountLabel(selectedKas) || '1100 - Kas',
                debit: nominal,
                credit: 0,
                impact: 'Kas/bank bertambah',
            },
            {
                account:
                    jenis === 'PINJAMAN_KARYAWAN'
                        ? '1160 - Piutang Karyawan'
                        : '1120 - Piutang Usaha',
                debit: 0,
                credit: nominal,
                impact:
                    jenis === 'PINJAMAN_KARYAWAN'
                        ? 'Saldo pinjaman karyawan berkurang'
                        : 'Piutang pelanggan berkurang',
            },
        ];
    }, [jenis, nominal, selectedKas]);

    const totals = journalRows.reduce(
        (sum, row) => ({
            debit: sum.debit + row.debit,
            credit: sum.credit + row.credit,
        }),
        { debit: 0, credit: 0 },
    );

    const changeType = (nextType: SettlementType) => {
        setJenis(nextType);
        setRecordId('');
        setNominal(0);
    };

    const changeRecord = (nextRecordId: string) => {
        setRecordId(nextRecordId);
        const nextRecord = activeRecords.find(
            (record) => String(record.id) === nextRecordId,
        );
        setNominal(nextRecord?.sisa ?? 0);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/pelunasan', { preserveScroll: true });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Pelunasan" />
                <PelunasanSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Pelunasan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Input Pelunasan
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Catat penerimaan piutang, pembayaran hutang, atau
                            pengembalian pinjaman karyawan.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Handshake className="size-5" />
                                Input Pelunasan Hutang / Piutang
                            </CardTitle>
                            <CardDescription>
                                Pilih saldo yang dilunasi, rekening kas/bank,
                                nominal pembayaran, dan catatan transaksi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <section className="grid gap-3">
                                <Label>Jenis Pelunasan</Label>
                                <div className="grid gap-2 md:grid-cols-3">
                                    {settlementOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                changeType(option.value)
                                            }
                                            className={`flex min-h-24 items-start gap-3 rounded-md border p-3 text-left text-sm transition ${
                                                jenis === option.value
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
                                    name="jenis"
                                    value={jenis}
                                />
                                <Field
                                    label={
                                        jenis === 'HUTANG'
                                            ? 'Pilih Hutang'
                                            : jenis === 'PINJAMAN_KARYAWAN'
                                              ? 'Pilih Karyawan'
                                              : 'Pilih Piutang'
                                    }
                                    required
                                >
                                    <NativeSelect
                                        name={
                                            jenis === 'PINJAMAN_KARYAWAN'
                                                ? 'pinjaman_nama'
                                                : 'record_id'
                                        }
                                        value={recordId}
                                        onChange={(event) =>
                                            changeRecord(event.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            {jenis === 'HUTANG'
                                                ? '-- Pilih hutang --'
                                                : jenis === 'PINJAMAN_KARYAWAN'
                                                  ? '-- Pilih karyawan --'
                                                  : '-- Pilih piutang --'}
                                        </option>
                                        {activeRecords.map((record) => (
                                            <option
                                                key={record.id}
                                                value={record.id}
                                            >
                                                {record.nama} |{' '}
                                                {rupiah(record.sisa)} sisa |{' '}
                                                {record.keterangan}
                                                {record.jatuhTempo
                                                    ? ` | JT: ${record.jatuhTempo}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>

                                <div className="rounded-md border bg-muted/30 p-3">
                                    <div className="flex items-start gap-3">
                                        {currentOption.icon}
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {selectedRecord?.nama ??
                                                    currentOption.label}
                                            </div>
                                            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {selectedRecord
                                                    ? `${selectedRecord.keterangan} - Sisa ${rupiah(selectedRecord.sisa)}`
                                                    : activeRecords.length > 0
                                                      ? 'Pilih data yang akan dilunasi.'
                                                      : `Tidak ada ${currentOption.label.toLowerCase()} aktif.`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Field label="Tanggal Bayar" required>
                                    <Input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={today}
                                        required
                                    />
                                </Field>

                                <Field label="Rekening yang Digunakan">
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

                                <Field
                                    label="Nominal Pelunasan"
                                    required
                                    hint={
                                        selectedRecord
                                            ? `Sisa maksimal saat ini ${rupiah(selectedRecord.sisa)}.`
                                            : undefined
                                    }
                                >
                                    <div className="grid gap-2">
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
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="h-auto w-fit px-0 py-0 text-xs"
                                            onClick={() =>
                                                selectedRecord &&
                                                setNominal(selectedRecord.sisa)
                                            }
                                        >
                                            Lunasi semua
                                        </Button>
                                    </div>
                                </Field>

                                <Field label="Catatan">
                                    <Input
                                        name="catatan"
                                        placeholder="Catatan pembayaran..."
                                    />
                                </Field>
                            </section>

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
                                    Simpan Pelunasan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
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
                                    Pilih data dan isi nominal untuk melihat
                                    jurnal otomatis.
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

function PelunasanSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-2 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-24 w-full rounded-md"
                            />
                        ))}
                    </div>
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
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
