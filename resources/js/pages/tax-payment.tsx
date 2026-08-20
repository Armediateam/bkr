import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
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

type Account = { kode: string; nama: string; saldo?: number };
type Props = {
    today: string;
    payables: Account[];
    cashAccounts: Account[];
    ppnMasukan: number;
};

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function TaxPayment({
    today,
    payables,
    cashAccounts,
    ppnMasukan,
}: Props) {
    const [payable, setPayable] = useState(payables[0]?.kode ?? '');
    const [nominal, setNominal] = useState(0);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();
    const selected = payables.find((row) => row.kode === payable);
    const ppnOffset =
        payable === '2111' ? Math.min(ppnMasukan, selected?.saldo ?? 0) : 0;
    const cashNeed = useMemo(
        () => Math.max(nominal - ppnOffset, 0),
        [nominal, ppnOffset],
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/pajak/setor', { preserveScroll: true });
    };
    if (showSkeleton) return <PageSkeleton title="Setor Pajak & Gaji" />;

    return (
        <>
            <Head title="Setor Pajak & Gaji" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Header title="Setor Pajak & Gaji" back="/dashboard/pajak" />
                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
                    <Card className="border-border/70 xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Form Pembayaran Hutang Pajak, BPJS, dan Gaji
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Field label="Tanggal Bayar">
                                <Input
                                    type="date"
                                    name="tanggal"
                                    defaultValue={today}
                                    required
                                />
                            </Field>
                            <Field label="Akun Hutang yang Dibayar">
                                <select
                                    name="akun_hutang"
                                    value={payable}
                                    onChange={(e) => setPayable(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {payables.map((row) => (
                                        <option key={row.kode} value={row.kode}>
                                            {row.kode} - {row.nama} ·{' '}
                                            {rupiah(row.saldo ?? 0)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Nominal Pembayaran ke Kas">
                                <Input
                                    type="number"
                                    name="nominal"
                                    min="0"
                                    value={nominal || ''}
                                    onChange={(e) =>
                                        setNominal(Number(e.target.value) || 0)
                                    }
                                    required
                                />
                            </Field>
                            <Field label="Dari Rekening / Kas">
                                <select
                                    name="akun_kas"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {cashAccounts.map((row) => (
                                        <option key={row.kode} value={row.kode}>
                                            {row.kode} - {row.nama}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <div className="md:col-span-2">
                                <Button disabled={processing}>
                                    <Save className="size-4" />
                                    Catat Pembayaran
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="h-fit border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">Preview</CardTitle>
                            <CardDescription>
                                PPN Masukan bisa dikreditkan saat setor PPN.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Preview
                                label="Saldo Akun"
                                value={rupiah(selected?.saldo ?? 0)}
                            />
                            <Preview
                                label="Kredit PPN Masukan"
                                value={rupiah(ppnOffset)}
                            />
                            <Preview
                                label="Kas Keluar"
                                value={rupiah(cashNeed)}
                            />
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

function Header({ title, back }: { title: string; back: string }) {
    return (
        <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-fit">
                <Link href={back}>Kembali ke Hub Pajak</Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
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
function Preview({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
function PageSkeleton({ title }: { title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Skeleton className="h-16 rounded-md" />
                <Skeleton className="h-96 rounded-md" />
            </div>
        </>
    );
}
