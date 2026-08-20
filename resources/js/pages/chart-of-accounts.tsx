import { Head, useForm } from '@inertiajs/react';
import { Lock, Plus, Save, Search } from 'lucide-react';
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
    subtipe: string;
    saldoNormal: string;
    pakai: number;
};

type Props = { accounts: Account[] };

const typeDefaults: Record<string, { saldo: string; subtipe: string }> = {
    Aset: { saldo: 'Debit', subtipe: 'Aset Lancar' },
    Liabilitas: { saldo: 'Kredit', subtipe: 'Liabilitas Lancar' },
    Ekuitas: { saldo: 'Kredit', subtipe: 'Modal' },
    Pendapatan: { saldo: 'Kredit', subtipe: 'Pendapatan Utama' },
    Beban: { saldo: 'Debit', subtipe: 'Operasional' },
};

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

export default function ChartOfAccounts({ accounts }: Props) {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('Aset');
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return accounts.filter((account) =>
            [account.kode, account.nama, account.tipe, account.subtipe]
                .join(' ')
                .toLowerCase()
                .includes(term),
        );
    }, [accounts, query]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/bagan-akun', { preserveScroll: true });
    };

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Bagan Akun" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Bagan Akun
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Chart of accounts untuk jurnal, laporan, saldo
                            normal, dan pengelompokan akun.
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Tambah Akun
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submit}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Akun Baru</DialogTitle>
                                    <DialogDescription>
                                        Kode dan saldo normal menentukan posisi
                                        akun dalam jurnal dan laporan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Field label="Kode" required>
                                        <Input
                                            name="kode"
                                            placeholder="1xxx"
                                            required
                                        />
                                    </Field>
                                    <Field label="Nama Akun" required>
                                        <Input name="nama" required />
                                    </Field>
                                    <Field label="Tipe" required>
                                        <select
                                            name="tipe"
                                            value={type}
                                            onChange={(event) =>
                                                setType(event.target.value)
                                            }
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {Object.keys(typeDefaults).map(
                                                (item) => (
                                                    <option
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </Field>
                                    <Field label="Saldo Normal">
                                        <select
                                            name="saldo_normal"
                                            defaultValue={
                                                typeDefaults[type]?.saldo ??
                                                'Debit'
                                            }
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="Debit">Debit</option>
                                            <option value="Kredit">
                                                Kredit
                                            </option>
                                        </select>
                                    </Field>
                                    <Field label="Subtipe / Kelompok">
                                        <Input
                                            name="subtipe"
                                            defaultValue={
                                                typeDefaults[type]?.subtipe ??
                                                ''
                                            }
                                        />
                                    </Field>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="size-4" />
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="border-border/70">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                className="pl-8"
                                placeholder="Cari kode, akun, tipe, subtipe..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">Daftar Akun</CardTitle>
                        <CardDescription>
                            Akun yang sudah dipakai jurnal dikunci agar laporan
                            historis tetap valid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[840px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-3 py-2 text-left">
                                            Kode
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Nama Akun
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Tipe
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Subtipe
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                            Saldo Normal
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-3 font-mono text-xs">
                                                {account.kode}
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                                {account.nama}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant="outline">
                                                    {account.tipe}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                {account.subtipe}
                                            </td>
                                            <td className="px-3 py-3">
                                                {account.saldoNormal}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {account.pakai > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Lock className="size-3" />
                                                        Dipakai {account.pakai}{' '}
                                                        jurnal
                                                    </span>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Baru
                                                    </Badge>
                                                )}
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

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-20 rounded-md" />
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
