import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type Company = { name: string; address: string };
type Slip = {
    id: string;
    period: string;
    employeeNumber: string;
    employeeName: string;
    position: string;
    taxStatus: string;
    ptkp: number;
    npwp: string;
    baseSalary: number;
    allowance: number;
    meal: number;
    transport: number;
    bonus: number;
    otherIncome: number;
    gross: number;
    bpjsHealthEmployee: number;
    bpjsEmploymentEmployee: number;
    pph21: number;
    netPay: number;
    bpjsHealthCompany: number;
    bpjsEmploymentCompany: number;
    note: string;
};

type Props = { company: Company; slip: Slip };

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function PayrollSlip({ company, slip }: Props) {
    const showSkeleton = usePageSkeleton();
    if (showSkeleton) return <PageSkeleton />;

    const totalDeductions =
        slip.bpjsHealthEmployee + slip.bpjsEmploymentEmployee + slip.pph21;

    return (
        <>
            <Head title={`Slip Gaji - ${slip.employeeName}`} />
            <div className="flex h-full w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 print:p-0">
                <div className="flex flex-wrap gap-2 print:hidden">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="size-4" />
                        Cetak / PDF
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/gaji/riwayat">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <Card className="mx-auto w-full max-w-[620px] overflow-hidden border-primary/50 print:max-w-none print:border-0 print:shadow-none">
                    <CardHeader className="bg-primary text-primary-foreground">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">
                                    {company.name}
                                </CardTitle>
                                <p className="mt-1 text-sm text-primary-foreground/80">
                                    {company.address}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs tracking-wider text-primary-foreground/70 uppercase">
                                    Slip Gaji
                                </div>
                                <div className="font-semibold">
                                    {slip.period}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-5 p-6">
                        <section className="grid gap-2 rounded-md border bg-muted/30 p-4 text-sm">
                            <Info
                                label="Nama"
                                value={slip.employeeName}
                                strong
                            />
                            <Info
                                label="No. Karyawan"
                                value={slip.employeeNumber}
                            />
                            <Info label="Jabatan" value={slip.position} />
                            <div className="grid grid-cols-[150px_1fr] gap-3">
                                <span className="text-muted-foreground">
                                    Status Pajak
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        {slip.taxStatus}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                        PTKP {rupiah(slip.ptkp)}/th
                                    </span>
                                </div>
                            </div>
                            <Info label="NPWP" value={slip.npwp} />
                            <Info label="Periode" value={slip.period} strong />
                        </section>

                        <section>
                            <SectionTitle>Penghasilan</SectionTitle>
                            <AmountRow
                                label="Gaji Pokok"
                                value={slip.baseSalary}
                            />
                            <AmountRow
                                label="Tunjangan Tetap"
                                value={slip.allowance}
                            />
                            <AmountRow label="Uang Makan" value={slip.meal} />
                            <AmountRow
                                label="Uang Transport"
                                value={slip.transport}
                            />
                            <AmountRow label="Bonus / THR" value={slip.bonus} />
                            <AmountRow
                                label="Lain-lain"
                                value={slip.otherIncome}
                            />
                            <AmountRow
                                label="Total Penghasilan Bruto"
                                value={slip.gross}
                                strong
                                divider
                            />
                        </section>

                        <section>
                            <SectionTitle>Potongan Karyawan</SectionTitle>
                            <AmountRow
                                label="BPJS Kesehatan (1%)"
                                value={slip.bpjsHealthEmployee}
                                negative
                            />
                            <AmountRow
                                label="BPJS Ketenagakerjaan JHT (2%) + JP (1%)"
                                value={slip.bpjsEmploymentEmployee}
                                negative
                            />
                            <AmountRow
                                label="PPh Pasal 21"
                                value={slip.pph21}
                                negative
                            />
                            <AmountRow
                                label="Total Potongan"
                                value={totalDeductions}
                                negative
                                strong
                                divider
                            />
                        </section>

                        <div className="flex items-center justify-between border-t-2 pt-4 text-lg font-bold text-primary">
                            <span>GAJI BERSIH (TAKE-HOME PAY)</span>
                            <span>{rupiah(slip.netPay)}</span>
                        </div>

                        <section>
                            <SectionTitle>
                                Tanggungan Perusahaan (Informasi)
                            </SectionTitle>
                            <AmountRow
                                label="BPJS Kesehatan (4%)"
                                value={slip.bpjsHealthCompany}
                            />
                            <AmountRow
                                label="BPJS Ketenagakerjaan JHT, JP, JKK, JKM"
                                value={slip.bpjsEmploymentCompany}
                            />
                        </section>

                        {slip.note && (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                <span className="text-muted-foreground">
                                    Catatan:{' '}
                                </span>
                                {slip.note}
                            </div>
                        )}

                        <section className="mt-4 grid grid-cols-2 gap-8 border-t pt-5 text-sm text-muted-foreground">
                            <Signature
                                label="Diterima oleh,"
                                name={slip.employeeName}
                            />
                            <Signature
                                alignRight
                                label="Disetujui oleh,"
                                name={company.name}
                            />
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Info({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="grid grid-cols-[150px_1fr] gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className={strong ? 'font-semibold' : ''}>{value}</span>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-2 border-b pb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {children}
        </div>
    );
}

function AmountRow({
    label,
    value,
    negative = false,
    strong = false,
    divider = false,
}: {
    label: string;
    value: number;
    negative?: boolean;
    strong?: boolean;
    divider?: boolean;
}) {
    if (!value) return null;

    return (
        <div
            className={`flex items-center justify-between py-1 text-sm ${divider ? 'mt-2 border-t border-dashed pt-2' : ''} ${strong ? 'font-semibold' : ''}`}
        >
            <span>{label}</span>
            <span className={negative ? 'text-destructive' : ''}>
                {negative ? '- ' : ''}
                {rupiah(value)}
            </span>
        </div>
    );
}

function Signature({
    label,
    name,
    alignRight = false,
}: {
    label: string;
    name: string;
    alignRight?: boolean;
}) {
    return (
        <div className={alignRight ? 'text-right' : ''}>
            <div>{label}</div>
            <div className="mt-14 border-t pt-2">({name})</div>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mx-auto h-[720px] w-full max-w-[620px]" />
        </div>
    );
}
