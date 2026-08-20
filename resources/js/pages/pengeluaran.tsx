import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Banknote,
    BriefcaseBusiness,
    CircleHelp,
    HandCoins,
    Landmark,
    Plus,
    Save,
    Scale,
    Settings,
    Trash2,
    Truck,
    UserRound,
    WalletCards,
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

type KasRow = {
    id: string;
    akun: string;
    nominal: number;
};

type Category =
    | 'OPERASIONAL'
    | 'PAJAK'
    | 'PENARIKAN_OWNER'
    | 'PINJAMAN_KARYAWAN';

type PengeluaranProps = {
    today: string;
    akunKas: Account[];
    akunBeban: Account[];
    akunPajak: Account[];
    akunPrive: Account[];
    subkategoriList: string[];
    proyekAktif: ProjectOption[];
    vendorList: string[];
    karyawanList: string[];
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const emptyKasRow = (akun = ''): KasRow => ({
    id: makeId(),
    akun,
    nominal: 0,
});

const operationalAccounts: Record<string, string> = {
    Gaji: '6100 - Beban Gaji',
    Sewa: '6110 - Beban Sewa',
    Utilitas: '6120 - Beban Listrik & Air',
    Pemasaran: '6140 - Beban Pemasaran',
    Administrasi: '6150 - Beban Administrasi',
    Bunga: '6160 - Beban Bunga',
    Lainnya: '6180 - Beban Lainnya',
};

const categoryInfo: Record<
    Category,
    {
        title: string;
        description: string;
        icon: ReactNode;
        tone: string;
    }
> = {
    OPERASIONAL: {
        title: 'Biaya Operasional',
        description:
            'Pengeluaran rutin untuk menjalankan bisnis seperti gaji, sewa, utilitas, promosi, dan administrasi. Mengurangi laba pada periode yang sama.',
        icon: <Settings className="size-5" />,
        tone: 'border-border/70 bg-muted/30 text-foreground',
    },
    PAJAK: {
        title: 'Pajak',
        description:
            'Pembayaran pajak yang dikeluarkan bisnis. Bisa dibayar langsung atau diakui sekarang dan dibayar pada periode berikutnya.',
        icon: <Landmark className="size-5" />,
        tone: 'border-border/70 bg-muted/30 text-foreground',
    },
    PENARIKAN_OWNER: {
        title: 'Penarikan Owner',
        description:
            'Uang yang diambil pemilik dari bisnis. Bukan beban usaha, tidak mengurangi laba, tapi mengurangi ekuitas atau menjadi hutang ke owner.',
        icon: <UserRound className="size-5" />,
        tone: 'border-border/70 bg-muted/30 text-foreground',
    },
    PINJAMAN_KARYAWAN: {
        title: 'Pinjaman Karyawan',
        description:
            'Kasbon dicatat sebagai Piutang Karyawan di neraca, bukan beban. Pengembalian nantinya dicatat melalui menu Pelunasan.',
        icon: <HandCoins className="size-5" />,
        tone: 'border-border/70 bg-muted/30 text-foreground',
    },
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

export default function Pengeluaran({
    today,
    akunKas,
    akunBeban,
    akunPajak,
    akunPrive,
    subkategoriList,
    proyekAktif,
    vendorList,
    karyawanList,
}: PengeluaranProps) {
    const [kategori, setKategori] = useState<Category>('OPERASIONAL');
    const [multiKas, setMultiKas] = useState(false);
    const [kasRows, setKasRows] = useState<KasRow[]>([
        emptyKasRow(akunKas[0]?.kode ?? ''),
    ]);
    const [subkategori, setSubkategori] = useState(
        subkategoriList[0] ?? 'Lainnya',
    );
    const [bebanMode, setBebanMode] = useState<'preset' | 'coa'>('preset');
    const [akunBebanKode, setAkunBebanKode] = useState('');
    const [akunPajakKode, setAkunPajakKode] = useState('');
    const [akunPriveKode, setAkunPriveKode] = useState('');
    const [vendor, setVendor] = useState('');
    const [karyawan, setKaryawan] = useState('');
    const [nominal, setNominal] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);
    const [pajakAktif, setPajakAktif] = useState(false);
    const [ppnPct, setPpnPct] = useState(11);
    const [pph23Pct, setPph23Pct] = useState(0);
    const [showHelp, setShowHelp] = useState(false);
    const [processing, setProcessing] = useState(false);
    const showSkeleton = usePageSkeleton();

    const isPinjaman = kategori === 'PINJAMAN_KARYAWAN';
    const ppn = !isPinjaman && pajakAktif ? nominal * (ppnPct / 100) : 0;
    const pph23 = !isPinjaman && pajakAktif ? nominal * (pph23Pct / 100) : 0;
    const totalKewajiban = isPinjaman
        ? nominal
        : Math.max(nominal + ppn - pph23, 0);
    const effectiveKeluar = isPinjaman ? nominal : uangKeluar || totalKewajiban;
    const hutang = isPinjaman
        ? 0
        : Math.max(totalKewajiban - effectiveKeluar, 0);
    const multiKasTotal = kasRows.reduce((sum, row) => sum + row.nominal, 0);
    const currentInfo = categoryInfo[kategori];

    const debitAccount = useMemo(() => {
        if (kategori === 'PAJAK') {
            const selected = akunPajak.find(
                (account) => account.kode === akunPajakKode,
            );
            return {
                account: accountLabel(selected) || '6170 - Beban Pajak',
                impact: 'Beban pajak mengurangi laba',
            };
        }

        if (kategori === 'PENARIKAN_OWNER') {
            const selected = akunPrive.find(
                (account) => account.kode === akunPriveKode,
            );
            return {
                account:
                    accountLabel(selected) || '3300 - Prive / Penarikan Owner',
                impact: 'Mengurangi ekuitas, bukan beban usaha',
            };
        }

        if (kategori === 'PINJAMAN_KARYAWAN') {
            return {
                account: '1160 - Piutang Karyawan',
                impact: 'Piutang karyawan bertambah, bukan beban',
            };
        }

        const selected = akunBeban.find(
            (account) => account.kode === akunBebanKode,
        );
        return {
            account:
                bebanMode === 'coa' && selected
                    ? accountLabel(selected)
                    : operationalAccounts[subkategori] ||
                      '6180 - Beban Lainnya',
            impact: 'Beban operasional mengurangi laba',
        };
    }, [
        akunBeban,
        akunBebanKode,
        akunPajak,
        akunPajakKode,
        akunPrive,
        akunPriveKode,
        bebanMode,
        kategori,
        subkategori,
    ]);

    const journalRows = useMemo(() => {
        const rows: Array<{
            account: string;
            debit: number;
            credit: number;
            impact: string;
        }> = [];

        if (nominal <= 0) {
            return rows;
        }

        rows.push({
            account: debitAccount.account,
            debit: nominal,
            credit: 0,
            impact: debitAccount.impact,
        });

        if (ppn > 0) {
            rows.push({
                account: '1180 - PPN Masukan',
                debit: ppn,
                credit: 0,
                impact: 'PPN yang bisa dikreditkan',
            });
        }

        if (multiKas) {
            kasRows.forEach((row) => {
                if (row.nominal <= 0) {
                    return;
                }

                const selected = akunKas.find(
                    (account) => account.kode === row.akun,
                );
                rows.push({
                    account: accountLabel(selected) || 'Kas/Bank',
                    debit: 0,
                    credit: row.nominal,
                    impact: 'Kas/bank berkurang',
                });
            });
        } else if (effectiveKeluar > 0) {
            rows.push({
                account: accountLabel(akunKas[0]) || 'Kas/Bank',
                debit: 0,
                credit: effectiveKeluar,
                impact: 'Kas/bank berkurang',
            });
        }

        if (hutang > 0) {
            const account =
                kategori === 'PAJAK'
                    ? '2110 - Hutang Pajak'
                    : kategori === 'PENARIKAN_OWNER'
                      ? '2140 - Hutang kepada Owner'
                      : '2100 - Hutang Usaha';

            rows.push({
                account,
                debit: 0,
                credit: hutang,
                impact: 'Kewajiban bayar bertambah',
            });
        }

        if (pph23 > 0) {
            rows.push({
                account: '2112 - Hutang PPh Pasal 23',
                debit: 0,
                credit: pph23,
                impact: 'Wajib setor PPh 23',
            });
        }

        return rows;
    }, [
        akunKas,
        debitAccount,
        effectiveKeluar,
        hutang,
        kasRows,
        kategori,
        multiKas,
        nominal,
        pph23,
        ppn,
    ]);

    const changeCategory = (nextCategory: Category) => {
        setKategori(nextCategory);
        if (nextCategory === 'PINJAMAN_KARYAWAN') {
            setPajakAktif(false);
            setUangKeluar(nominal);
        }
    };

    const changeNominal = (value: number) => {
        setNominal(value);
        setUangKeluar(value);
    };

    const updateKasRow = (id: string, patch: Partial<KasRow>) => {
        setKasRows((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set('kategori', kategori);
        formData.set('subkategori', subkategori);
        formData.set('akun_beban_kode', akunBebanKode);
        formData.set('akun_pajak_kode', akunPajakKode);
        formData.set('akun_prive_kode', akunPriveKode);
        formData.set('ppn_pct', String(pajakAktif ? ppnPct : 0));
        formData.set('pph23_pct', String(pajakAktif ? pph23Pct : 0));

        router.post('/dashboard/pengeluaran', formData, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    if (showSkeleton) {
        return (
            <>
                <Head title="Input Pengeluaran" />
                <PengeluaranSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Input Pengeluaran" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Input Pengeluaran
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Catat biaya operasional, pajak, penarikan owner,
                            pinjaman karyawan, hutang, multi rekening, dan
                            preview jurnal otomatis.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setShowHelp((value) => !value)}
                    >
                        <CircleHelp className="size-4" />
                        Bantuan
                    </Button>
                </div>

                {showHelp && (
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Panduan Pengeluaran
                            </CardTitle>
                            <CardDescription>
                                Pengeluaran di halaman ini dipakai untuk
                                transaksi non-pembelian.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm leading-relaxed text-muted-foreground">
                            Belanja bahan baku/stok dan aset tetap sudah
                            dipindahkan ke menu{' '}
                            <Link
                                href="/dashboard/pembelian"
                                className="font-semibold underline"
                            >
                                Pembelian
                            </Link>
                            . Menu ini difokuskan untuk pengeluaran
                            non-pembelian, penarikan owner, pajak, dan kasbon.
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={submit}>
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ArrowDownToLine className="size-5" />
                                Form Pengeluaran
                            </CardTitle>
                            <CardDescription>
                                Catat biaya, pajak, penarikan owner, kasbon,
                                pembayaran, hutang, dan jurnal otomatis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">
                            <section className="grid gap-3">
                                <Label>
                                    Kategori Pengeluaran{' '}
                                    <span className="text-red-600">*</span>
                                </Label>
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                    {(
                                        [
                                            [
                                                'OPERASIONAL',
                                                'Operasional',
                                                <Settings
                                                    key="operasional"
                                                    className="size-5"
                                                />,
                                            ],
                                            [
                                                'PAJAK',
                                                'Pajak',
                                                <Landmark
                                                    key="pajak"
                                                    className="size-5"
                                                />,
                                            ],
                                            [
                                                'PENARIKAN_OWNER',
                                                'Penarikan Owner',
                                                <UserRound
                                                    key="owner"
                                                    className="size-5"
                                                />,
                                            ],
                                            [
                                                'PINJAMAN_KARYAWAN',
                                                'Pinjaman Karyawan',
                                                <HandCoins
                                                    key="karyawan"
                                                    className="size-5"
                                                />,
                                            ],
                                        ] as Array<
                                            [Category, string, ReactNode]
                                        >
                                    ).map(([value, label, icon]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                changeCategory(value)
                                            }
                                            className={`flex min-h-16 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                                                kategori === value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:bg-muted/60'
                                            }`}
                                        >
                                            {icon}
                                            <span className="font-semibold">
                                                {label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div
                                    className={`flex items-start gap-3 rounded-md border p-3 text-sm ${currentInfo.tone}`}
                                >
                                    <span className="mt-0.5 shrink-0">
                                        {currentInfo.icon}
                                    </span>
                                    <div>
                                        <div className="font-semibold">
                                            {currentInfo.title}
                                        </div>
                                        <div className="mt-1 leading-relaxed">
                                            {currentInfo.description}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <Field label="Tanggal" required>
                                    <Input
                                        type="date"
                                        defaultValue={today}
                                        max={today}
                                        name="tanggal"
                                        required
                                    />
                                </Field>

                                {!multiKas && (
                                    <Field
                                        label="Keluar dari Rekening"
                                        hint={
                                            effectiveKeluar <= 0 && !isPinjaman
                                                ? 'Masukkan uang keluar jika ingin memilih rekening.'
                                                : undefined
                                        }
                                    >
                                        <div className="flex gap-2">
                                            <NativeSelect
                                                name="akun_kas"
                                                disabled={
                                                    effectiveKeluar <= 0 &&
                                                    !isPinjaman
                                                }
                                            >
                                                {akunKas.map((account) => (
                                                    <option
                                                        key={account.kode}
                                                        value={account.kode}
                                                    >
                                                        {account.kode} -{' '}
                                                        {account.nama}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setMultiKas(true)
                                                }
                                            >
                                                <WalletCards className="size-4" />
                                                Multi
                                            </Button>
                                        </div>
                                    </Field>
                                )}
                            </section>

                            {multiKas && (
                                <section className="grid gap-3 rounded-md border p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <WalletCards className="size-5 text-red-600" />
                                            Keluar dari Rekening
                                            <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                                MULTI
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMultiKas(false)}
                                        >
                                            Mode Single
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto rounded-md border">
                                        <table className="w-full min-w-[560px] text-sm">
                                            <thead className="bg-muted/60">
                                                <tr className="text-left">
                                                    <th className="px-3 py-2">
                                                        Rekening
                                                    </th>
                                                    <th className="w-56 px-3 py-2">
                                                        Nominal
                                                    </th>
                                                    <th className="w-12 px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kasRows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            <NativeSelect
                                                                value={row.akun}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateKasRow(
                                                                        row.id,
                                                                        {
                                                                            akun: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    -- Pilih
                                                                    Rekening --
                                                                </option>
                                                                {akunKas.map(
                                                                    (
                                                                        account,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                account.kode
                                                                            }
                                                                            value={
                                                                                account.kode
                                                                            }
                                                                        >
                                                                            {
                                                                                account.kode
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                account.nama
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </NativeSelect>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <MoneyInput
                                                                value={
                                                                    row.nominal ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateKasRow(
                                                                        row.id,
                                                                        {
                                                                            nominal:
                                                                                numberValue(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setKasRows(
                                                                        (
                                                                            rows,
                                                                        ) =>
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
                                                                                      emptyKasRow(
                                                                                          akunKas[0]
                                                                                              ?.kode ??
                                                                                              '',
                                                                                      ),
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
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setKasRows((rows) => [
                                                    ...rows,
                                                    emptyKasRow(
                                                        akunKas[0]?.kode ?? '',
                                                    ),
                                                ])
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Tambah Rekening
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Total:{' '}
                                            <strong className="text-sky-600">
                                                {rupiah(multiKasTotal)}
                                            </strong>{' '}
                                            / Uang Keluar:{' '}
                                            <strong>
                                                {rupiah(effectiveKeluar)}
                                            </strong>
                                        </span>
                                        {multiKasTotal > effectiveKeluar && (
                                            <span className="text-sm font-medium text-red-600">
                                                Total rekening melebihi uang
                                                keluar.
                                            </span>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className="grid gap-4 md:grid-cols-2">
                                {kategori === 'OPERASIONAL' && (
                                    <div className="grid gap-4 md:col-span-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Label className="mb-0">
                                                Akun Beban
                                            </Label>
                                            <div className="flex rounded-md border p-1">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        bebanMode === 'preset'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    onClick={() =>
                                                        setBebanMode('preset')
                                                    }
                                                >
                                                    Subkategori
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        bebanMode === 'coa'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    onClick={() =>
                                                        setBebanMode('coa')
                                                    }
                                                >
                                                    COA
                                                </Button>
                                            </div>
                                        </div>
                                        {bebanMode === 'preset' ? (
                                            <Field
                                                label="Subkategori"
                                                hint="Pilih subkategori beban operasional bawaan."
                                            >
                                                <NativeSelect
                                                    value={subkategori}
                                                    onChange={(event) =>
                                                        setSubkategori(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    {subkategoriList.map(
                                                        (item) => (
                                                            <option
                                                                key={item}
                                                                value={item}
                                                            >
                                                                {item}
                                                            </option>
                                                        ),
                                                    )}
                                                </NativeSelect>
                                            </Field>
                                        ) : (
                                            <Field
                                                label="Pilih Akun COA"
                                                hint="Cocok untuk akun beban yang ditambahkan sendiri."
                                            >
                                                <NativeSelect
                                                    value={akunBebanKode}
                                                    onChange={(event) =>
                                                        setAkunBebanKode(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        -- Pilih akun beban dari
                                                        COA --
                                                    </option>
                                                    {akunBeban.map(
                                                        (account) => (
                                                            <option
                                                                key={
                                                                    account.kode
                                                                }
                                                                value={
                                                                    account.kode
                                                                }
                                                            >
                                                                {account.kode} -{' '}
                                                                {account.nama}
                                                            </option>
                                                        ),
                                                    )}
                                                </NativeSelect>
                                            </Field>
                                        )}
                                    </div>
                                )}

                                {kategori === 'PAJAK' && (
                                    <Field
                                        label="Akun Beban Pajak (COA)"
                                        hint="Biarkan kosong untuk default 6170 Beban Pajak."
                                    >
                                        <NativeSelect
                                            value={akunPajakKode}
                                            onChange={(event) =>
                                                setAkunPajakKode(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Default (6170 Beban Pajak) --
                                            </option>
                                            {akunPajak.map((account) => (
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
                                )}

                                {kategori === 'PENARIKAN_OWNER' && (
                                    <Field
                                        label="Akun Ekuitas / Prive (COA)"
                                        hint="Biarkan kosong untuk default 3300 Prive."
                                    >
                                        <NativeSelect
                                            value={akunPriveKode}
                                            onChange={(event) =>
                                                setAkunPriveKode(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Default (3300 Prive) --
                                            </option>
                                            {akunPrive.map((account) => (
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
                                )}

                                {kategori === 'PINJAMAN_KARYAWAN' && (
                                    <Field
                                        label="Nama Karyawan"
                                        required
                                        hint="Pinjaman dicatat sebagai Piutang Karyawan di neraca, bukan beban."
                                    >
                                        <Input
                                            name="karyawan_nama"
                                            list="karyawan-list"
                                            value={karyawan}
                                            onChange={(event) =>
                                                setKaryawan(event.target.value)
                                            }
                                            placeholder="Cari / ketik nama karyawan"
                                        />
                                        <datalist id="karyawan-list">
                                            {karyawanList.map((name) => (
                                                <option
                                                    key={name}
                                                    value={name}
                                                />
                                            ))}
                                        </datalist>
                                    </Field>
                                )}

                                {kategori !== 'PENARIKAN_OWNER' &&
                                    kategori !== 'PINJAMAN_KARYAWAN' && (
                                        <Field
                                            label="Vendor / Pemasok"
                                            hint="Opsional, dapat disimpan ke database vendor."
                                        >
                                            <Input
                                                name="vendor"
                                                list="vendor-list"
                                                value={vendor}
                                                onChange={(event) =>
                                                    setVendor(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Cari / ketik nama vendor"
                                            />
                                            <datalist id="vendor-list">
                                                {vendorList.map((name) => (
                                                    <option
                                                        key={name}
                                                        value={name}
                                                    />
                                                ))}
                                            </datalist>
                                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Checkbox
                                                    name="simpan_vendor"
                                                    value="1"
                                                />
                                                <Truck className="size-3.5" />
                                                Simpan ke database vendor
                                            </label>
                                        </Field>
                                    )}

                                <Field label="Keterangan">
                                    <Input
                                        name="keterangan"
                                        placeholder="Keterangan pengeluaran..."
                                    />
                                </Field>

                                <Field
                                    label="Proyek"
                                    hint="Opsional, biaya akan dihitung ke laba rugi proyek ini."
                                >
                                    <NativeSelect name="proyek_id">
                                        <option value="">
                                            -- Tanpa proyek --
                                        </option>
                                        {proyekAktif.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.kode} - {project.nama}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <Field
                                    label="Nominal Invoice (Total Pengeluaran)"
                                    required
                                >
                                    <MoneyInput
                                        name="nominal"
                                        value={nominal || ''}
                                        onChange={(event) =>
                                            changeNominal(
                                                numberValue(event.target.value),
                                            )
                                        }
                                        required
                                        placeholder="0"
                                    />
                                </Field>

                                {!isPinjaman && (
                                    <>
                                        <Field
                                            label="Uang Keluar"
                                            hint="Biarkan 0 jika semua hutang, atau pakai Full Cash untuk bayar penuh."
                                        >
                                            <div className="flex gap-2">
                                                <MoneyInput
                                                    name="uang_keluar"
                                                    value={uangKeluar || ''}
                                                    onChange={(event) =>
                                                        setUangKeluar(
                                                            numberValue(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setUangKeluar(
                                                            totalKewajiban,
                                                        )
                                                    }
                                                >
                                                    <Banknote className="size-4" />
                                                    Full
                                                </Button>
                                            </div>
                                        </Field>

                                        <Field
                                            label="Hutang (Auto)"
                                            hint="Nominal + PPN - PPh 23 - uang keluar."
                                        >
                                            <Input
                                                value={rupiah(hutang)}
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </Field>
                                    </>
                                )}
                            </section>

                            {hutang > 0 && (
                                <section className="grid gap-3 rounded-md border bg-muted/30 p-4">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <HandCoins className="size-5" />
                                        Detail Hutang
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Pemasok / Kreditur">
                                            <Input
                                                name="pemasok"
                                                placeholder="Nama pemasok / kreditur"
                                            />
                                        </Field>
                                        <Field label="Jatuh Tempo">
                                            <Input
                                                type="date"
                                                name="jatuh_tempo"
                                            />
                                        </Field>
                                    </div>
                                </section>
                            )}

                            {!isPinjaman && (
                                <section className="grid gap-3 rounded-md border p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="pajak-aktif"
                                            checked={pajakAktif}
                                            onCheckedChange={(checked) =>
                                                setPajakAktif(checked === true)
                                            }
                                        />
                                        <div>
                                            <Label
                                                htmlFor="pajak-aktif"
                                                className="font-semibold"
                                            >
                                                Tambahkan Fitur Pajak
                                            </Label>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Aktifkan jika pengeluaran
                                                memiliki PPN Masukan dari
                                                supplier PKP atau PPh 23 yang
                                                dipotong dari supplier.
                                            </p>
                                        </div>
                                    </div>

                                    {pajakAktif && (
                                        <>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Field label="Tarif PPN Masukan (%)">
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
                                                <Field label="Potong PPh 23 ke Supplier (%)">
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
                                            </div>
                                            <div className="grid overflow-hidden rounded-md border bg-background md:grid-cols-4">
                                                <SummaryBox
                                                    title="DPP"
                                                    value={rupiah(nominal)}
                                                    hint="Nominal"
                                                    tone="amber"
                                                />
                                                <SummaryBox
                                                    title="+ PPN Masukan"
                                                    value={rupiah(ppn)}
                                                    hint="Dikreditkan"
                                                    tone="blue"
                                                />
                                                <SummaryBox
                                                    title="- PPh 23"
                                                    value={rupiah(pph23)}
                                                    hint="Dipotong"
                                                    tone="red"
                                                />
                                                <SummaryBox
                                                    title="Dibayar/Terhutang"
                                                    value={rupiah(
                                                        totalKewajiban,
                                                    )}
                                                    hint="Total kewajiban"
                                                    tone="green"
                                                />
                                            </div>
                                        </>
                                    )}
                                </section>
                            )}

                            <section className="grid gap-3 rounded-md border p-4">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Scale className="size-5" />
                                    Preview Jurnal Otomatis
                                </CardTitle>
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
                                            {journalRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-3 py-6 text-center text-muted-foreground"
                                                    >
                                                        Isi nominal untuk
                                                        melihat jurnal otomatis.
                                                    </td>
                                                </tr>
                                            ) : (
                                                journalRows.map(
                                                    (row, index) => (
                                                        <JournalRow
                                                            key={`${row.account}-${index}`}
                                                            account={
                                                                row.account
                                                            }
                                                            debit={row.debit}
                                                            credit={row.credit}
                                                            impact={row.impact}
                                                        />
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {nominal > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Preview mengikuti kategori, rekening,
                                        uang keluar, pajak, dan hutang yang
                                        sedang dipilih.
                                    </p>
                                )}
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Simpan Pengeluaran
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function PengeluaranSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <Card>
                <CardHeader className="border-b">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-16 w-full rounded-md"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-24 w-full rounded-md" />
                    <div className="grid gap-4 md:grid-cols-2">
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
                                className="h-20 w-full rounded-md"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-32 w-full rounded-md" />
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
