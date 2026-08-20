import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Account = {
    kode: string;
    nama: string;
    tipe: string;
    saldoNormal: string;
};
type Entry = {
    tanggal: string;
    ref: string;
    keterangan: string;
    debit: number;
    kredit: number;
    saldo: number;
};
type Props = {
    dateFrom: string;
    dateTo: string;
    accounts: Account[];
    selectedAccount: Account;
    openingBalance: number;
    entries: Entry[];
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

export default function ReportGeneralLedger({
    dateFrom,
    dateTo,
    accounts,
    selectedAccount,
    openingBalance,
    entries,
}: Props) {
    const showSkeleton = usePageSkeleton();
    const totals = entries.reduce(
        (sum, entry) => ({
            debit: sum.debit + entry.debit,
            kredit: sum.kredit + entry.kredit,
        }),
        { debit: 0, kredit: 0 },
    );
    const ending = entries.at(-1)?.saldo ?? openingBalance;

    if (showSkeleton) {
        return <PageSkeleton />;
    }

    return (
        <>
            <Head title="Buku Besar" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Buku Besar
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Mutasi per akun beserta saldo berjalan untuk periode
                        laporan.
                    </p>
                </div>
                <Card className="border-border/70">
                    <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_160px_160px_auto]">
                        <select
                            defaultValue={selectedAccount.kode}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {accounts.map((account) => (
                                <option key={account.kode} value={account.kode}>
                                    {account.kode} - {account.nama}
                                </option>
                            ))}
                        </select>
                        <Input type="date" defaultValue={dateFrom} />
                        <Input type="date" defaultValue={dateTo} />
                        <Button variant="outline">
                            <Printer className="size-4" />
                            Cetak / PDF
                        </Button>
                    </CardContent>
                </Card>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Metric
                        label="Akun"
                        value={`${selectedAccount.kode} - ${selectedAccount.nama}`}
                    />
                    <Metric label="Tipe" value={selectedAccount.tipe} />
                    <Metric
                        label="Saldo Normal"
                        value={selectedAccount.saldoNormal}
                    />
                    <Metric label="Saldo Akhir" value={rupiah(ending)} />
                </section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Mutasi Buku Besar
                        </CardTitle>
                        <CardDescription>
                            Total debit {rupiah(totals.debit)} dan kredit{' '}
                            {rupiah(totals.kredit)}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Ref</th>
                                        <th className="px-3 py-2">
                                            Keterangan
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Debit
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Kredit
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t bg-muted/20">
                                        <td className="px-3 py-2" colSpan={5}>
                                            Saldo Awal (sebelum periode)
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {rupiah(openingBalance)}
                                        </td>
                                    </tr>
                                    {entries.map((entry) => (
                                        <tr
                                            key={entry.ref}
                                            className="border-t"
                                        >
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {entry.tanggal}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs">
                                                {entry.ref}
                                            </td>
                                            <td className="px-3 py-2">
                                                {entry.keterangan}
                                            </td>
                                            <td className="px-3 py-2 text-right text-emerald-700">
                                                {entry.debit
                                                    ? rupiah(entry.debit)
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right text-red-700">
                                                {entry.kredit
                                                    ? rupiah(entry.kredit)
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                {rupiah(entry.saldo)}
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

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card className="border-border/70">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-20 rounded-md" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
