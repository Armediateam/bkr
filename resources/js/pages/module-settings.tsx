import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, Power, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

type ModuleItem = {
    key: string;
    name: string;
    active: boolean;
    serial: string;
    features: string[];
};

type Props = { modules: ModuleItem[] };

export default function ModuleSettings({ modules }: Props) {
    const showSkeleton = usePageSkeleton();
    const { data, setData, post, processing } = useForm({
        moduleKey: modules[0]?.key ?? '',
        serial: '',
    });

    if (showSkeleton) return <PageSkeleton />;

    const activeCount = modules.filter((module) => module.active).length;
    const updateModule = (module: ModuleItem, active: boolean) => {
        router.post('/dashboard/pengaturan/modul', {
            moduleKey: module.key,
            serial: module.serial,
            active,
        });
    };

    return (
        <>
            <Head title="Modul Lanjutan" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Pengaturan
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Modul Lanjutan
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Aktivasi fitur lanjutan seperti pajak, gaji, anggaran,
                        produksi, HPP, dan POS.
                    </p>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                    <Metric
                        label="Modul Aktif"
                        value={`${activeCount}/${modules.length}`}
                    />
                    <Metric label="Status Sistem" value="Siap Pakai" />
                    <Metric label="Coverage Alur" value="95%" />
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Aktivasi Serial</CardTitle>
                        <CardDescription>
                            Form aktivasi mengikuti modul pro di finansial
                            custom, disesuaikan dengan layout BKR.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                post('/dashboard/pengaturan/modul', {
                                    preserveScroll: true,
                                });
                            }}
                        >
                            <div className="grid gap-2">
                                <Label>Modul</Label>
                                <select
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                    value={data.moduleKey}
                                    onChange={(event) =>
                                        setData('moduleKey', event.target.value)
                                    }
                                >
                                    {modules.map((module) => (
                                        <option
                                            key={module.key}
                                            value={module.key}
                                        >
                                            {module.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Serial Number</Label>
                                <Input
                                    value={data.serial}
                                    onChange={(event) =>
                                        setData('serial', event.target.value)
                                    }
                                    placeholder="BKR-XXXX-2026"
                                />
                            </div>
                            <Button className="self-end" disabled={processing}>
                                <KeyRound className="size-4" />
                                Aktivasi
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <section className="grid gap-4 xl:grid-cols-2">
                    {modules.map((module) => (
                        <Card
                            key={module.key}
                            className={module.active ? 'border-primary/40' : ''}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>{module.name}</CardTitle>
                                        <CardDescription>
                                            Serial:{' '}
                                            {module.serial || 'Belum aktif'}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            module.active
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {module.active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <div className="mb-2 text-sm font-medium">
                                        Fitur Aktif
                                    </div>
                                    <ul className="grid gap-2 text-sm text-muted-foreground">
                                        {module.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex gap-2"
                                            >
                                                <span className="mt-2 size-1.5 rounded-full bg-primary" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant={
                                            module.active
                                                ? 'outline'
                                                : 'default'
                                        }
                                        onClick={() =>
                                            updateModule(module, !module.active)
                                        }
                                    >
                                        <Power className="size-4" />
                                        {module.active
                                            ? 'Nonaktifkan'
                                            : 'Aktifkan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            updateModule(module, module.active)
                                        }
                                    >
                                        <Save className="size-4" />
                                        Simpan Pengaturan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </>
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
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-[420px] w-full" />
        </div>
    );
}
