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

type Account = { kode: string; nama: string };
type Props = {
    today: string;
    debitAccounts: Account[];
    cashAccounts: Account[];
};
function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function TaxPkpPurchase({
    today,
    debitAccounts,
    cashAccounts,
}: Props) {
    const [dpp, setDpp] = useState(0);
    const [ppnPct, setPpnPct] = useState(11);
    const [pphPct, setPphPct] = useState(0);
    const { post, processing } = useForm({});
    const showSkeleton = usePageSkeleton();
    const calc = useMemo(() => {
        const ppn = (dpp * ppnPct) / 100;
        const pph = (dpp * pphPct) / 100;
        return { ppn, pph, bayar: dpp + ppn - pph };
    }, [dpp, pphPct, ppnPct]);
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/dashboard/pajak/pembelian-pkp', { preserveScroll: true });
    };
    if (showSkeleton) return <PageSkeleton title="Pembelian PKP" />;

    return (
        <>
            <Head title="Pembelian PKP" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-fit">
                        <Link href="/dashboard/pajak">
                            Kembali ke Hub Pajak
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Catat Pembelian PKP
                    </h1>
                </div>
                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
                    <Card className="border-border/70 xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Pembelian dengan PPN Masukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Field label="Tanggal">
                                <Input
                                    type="date"
                                    name="tanggal"
                                    defaultValue={today}
                                    required
                                />
                            </Field>
                            <Field label="Nama Supplier">
                                <Input
                                    name="supplier"
                                    placeholder="PT ABC / CV XYZ"
                                    required
                                />
                            </Field>
                            <Field label="Keterangan Pembelian">
                                <Input
                                    name="keterangan"
                                    placeholder="Beli bahan baku / sewa / dll"
                                />
                            </Field>
                            <Field label="Didebit ke Akun">
                                <select
                                    name="akun_debit"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {debitAccounts.map((row) => (
                                        <option key={row.kode} value={row.kode}>
                                            {row.kode} - {row.nama}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="DPP / Harga Sebelum Pajak">
                                <Input
                                    type="number"
                                    name="dpp"
                                    min="0"
                                    value={dpp || ''}
                                    onChange={(e) =>
                                        setDpp(Number(e.target.value) || 0)
                                    }
                                    required
                                />
                            </Field>
                            <Field label="PPN Masukan (%)">
                                <Input
                                    type="number"
                                    name="ppn_persen"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={ppnPct}
                                    onChange={(e) =>
                                        setPpnPct(Number(e.target.value) || 0)
                                    }
                                />
                            </Field>
                            <Field label="PPh 23 Dipotong (%)">
                                <Input
                                    type="number"
                                    name="pph23_persen"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={pphPct}
                                    onChange={(e) =>
                                        setPphPct(Number(e.target.value) || 0)
                                    }
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
                                    Simpan Pembelian & Buat Jurnal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="h-fit border-border/70">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Preview Pajak
                            </CardTitle>
                            <CardDescription>
                                Jurnal: Dr akun debit, Dr PPN Masukan, Cr
                                Kas/Hutang, Cr Hutang PPh23.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Preview label="DPP" value={rupiah(dpp)} />
                            <Preview
                                label={`PPN Masukan (${ppnPct}%)`}
                                value={rupiah(calc.ppn)}
                            />
                            <Preview
                                label={`Dikurang PPh 23 (${pphPct}%)`}
                                value={rupiah(calc.pph)}
                            />
                            <Preview
                                label="Total Dibayar"
                                value={rupiah(calc.bayar)}
                            />
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
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
