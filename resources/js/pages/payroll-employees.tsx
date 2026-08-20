import { Head, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
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

type Employee = {
    employeeNumber: string;
    name: string;
    position: string;
    employmentStatus: string;
    taxStatus: string;
    npwp: string;
    baseSalary: number;
    allowance: number;
    bpjsHealth: number;
    bpjsEmployment: number;
    pph21: number;
    active: boolean;
};

type PtkpReference = { code: string; label: string; amount: number };
type Props = { employees: Employee[]; ptkpReferences: PtkpReference[] };

function rupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function PayrollEmployees({ employees, ptkpReferences }: Props) {
    const showSkeleton = usePageSkeleton();
    const { data, setData, post, processing } = useForm({
        employeeNumber: '',
        name: '',
        position: '',
        employmentStatus: 'TETAP',
        taxStatus: 'TK0',
        npwp: '',
        baseSalary: '',
        allowance: '',
        bpjsHealth: true,
        bpjsEmployment: true,
    });

    if (showSkeleton) return <PageSkeleton />;

    const activeEmployees = employees.filter((employee) => employee.active);
    const payrollEstimate = activeEmployees.reduce(
        (sum, employee) => sum + employee.baseSalary + employee.allowance,
        0,
    );

    return (
        <>
            <Head title="Data Karyawan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Modul Gaji
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Data Karyawan
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Master karyawan untuk payroll, PTKP, NPWP, BPJS, dan
                        komponen gaji tetap.
                    </p>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Karyawan Aktif"
                        value={activeEmployees.length.toString()}
                    />
                    <Metric
                        label="Estimasi Gaji Pokok"
                        value={rupiah(payrollEstimate)}
                    />
                    <Metric
                        label="Estimasi PPh 21"
                        value={rupiah(
                            activeEmployees.reduce(
                                (sum, employee) => sum + employee.pph21,
                                0,
                            ),
                        )}
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Karyawan</CardTitle>
                            <CardDescription>
                                Sesuai form data karyawan di finansial custom:
                                nomor, status kerja, PTKP, BPJS, dan gaji.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="grid gap-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    post('/dashboard/gaji/karyawan');
                                }}
                            >
                                <Field label="No. Karyawan">
                                    <Input
                                        value={data.employeeNumber}
                                        onChange={(event) =>
                                            setData(
                                                'employeeNumber',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="BKR-005"
                                    />
                                </Field>
                                <Field label="Nama Lengkap">
                                    <Input
                                        required
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Nama karyawan"
                                    />
                                </Field>
                                <Field label="Jabatan">
                                    <Input
                                        value={data.position}
                                        onChange={(event) =>
                                            setData(
                                                'position',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Teknisi / Admin / Sales"
                                    />
                                </Field>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Status Kerja">
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={data.employmentStatus}
                                            onChange={(event) =>
                                                setData(
                                                    'employmentStatus',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="TETAP">
                                                Karyawan Tetap
                                            </option>
                                            <option value="KONTRAK">
                                                Karyawan Kontrak
                                            </option>
                                            <option value="HARIAN">
                                                Harian Lepas
                                            </option>
                                        </select>
                                    </Field>
                                    <Field label="Status Pajak">
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={data.taxStatus}
                                            onChange={(event) =>
                                                setData(
                                                    'taxStatus',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {ptkpReferences.map((ptkp) => (
                                                <option
                                                    key={ptkp.code}
                                                    value={ptkp.code}
                                                >
                                                    {ptkp.code}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <Field label="NPWP">
                                    <Input
                                        value={data.npwp}
                                        onChange={(event) =>
                                            setData('npwp', event.target.value)
                                        }
                                        placeholder="00.000.000.0-000.000"
                                    />
                                </Field>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Gaji Pokok">
                                        <Input
                                            required
                                            type="number"
                                            min="0"
                                            value={data.baseSalary}
                                            onChange={(event) =>
                                                setData(
                                                    'baseSalary',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Tunjangan Tetap">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.allowance}
                                            onChange={(event) =>
                                                setData(
                                                    'allowance',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <div className="grid gap-3 rounded-md border p-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={data.bpjsHealth}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'bpjsHealth',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        BPJS Kesehatan
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={data.bpjsEmployment}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'bpjsEmployment',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        BPJS Ketenagakerjaan
                                    </label>
                                </div>
                                <Button disabled={processing}>
                                    Tambah Karyawan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Karyawan</CardTitle>
                                <CardDescription>
                                    Basis data payroll dan perhitungan pajak
                                    karyawan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="py-2 pr-4">No.</th>
                                            <th className="py-2 pr-4">Nama</th>
                                            <th className="py-2 pr-4">
                                                Status
                                            </th>
                                            <th className="py-2 pr-4">PTKP</th>
                                            <th className="py-2 pr-4 text-right">
                                                Gaji Pokok
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                Tunjangan
                                            </th>
                                            <th className="py-2 pr-4 text-right">
                                                PPh 21
                                            </th>
                                            <th className="py-2 text-right">
                                                Aktif
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map((employee) => (
                                            <tr
                                                key={employee.employeeNumber}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4 font-medium">
                                                    {employee.employeeNumber}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium">
                                                        {employee.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {employee.position}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant="outline">
                                                        {
                                                            employee.employmentStatus
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    {employee.taxStatus}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(
                                                        employee.baseSalary,
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {rupiah(employee.allowance)}
                                                </td>
                                                <td className="py-3 pr-4 text-right text-destructive">
                                                    {rupiah(employee.pph21)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {employee.active
                                                        ? 'Ya'
                                                        : 'Tidak'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Referensi PTKP</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {ptkpReferences.map((ptkp) => (
                                    <div
                                        key={ptkp.code}
                                        className="rounded-md border p-3"
                                    >
                                        <div className="font-medium">
                                            {ptkp.code}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {ptkp.label}
                                        </div>
                                        <div className="mt-2 text-sm font-semibold">
                                            {rupiah(ptkp.amount)}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>
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

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="mt-1 text-xl font-semibold">{value}</div>
            </CardContent>
        </Card>
    );
}

function PageSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-xl p-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-[520px] w-full" />
        </div>
    );
}
