import { Head } from '@inertiajs/react';
import { History, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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

type Summary = {
    kategori: string;
    jumlah: number;
};

type LogRow = {
    id: number;
    waktu: string;
    kategori: string;
    aksi: string;
    user: string;
    role: string;
    detail: string;
};

type Props = {
    summary: Summary[];
    logs: LogRow[];
};

export default function ActivityLog({ summary, logs }: Props) {
    const [query, setQuery] = useState('');
    const showSkeleton = usePageSkeleton();

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        return logs.filter((log) =>
            [log.kategori, log.aksi, log.user, log.role, log.detail]
                .join(' ')
                .toLowerCase()
                .includes(term),
        );
    }, [logs, query]);

    if (showSkeleton) {
        return (
            <>
                <Head title="Log Aktivitas" />
                <PageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Log Aktivitas" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Log Aktivitas
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Pantau perubahan transaksi, inventory, master data,
                            dan aktivitas sistem.
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="pl-8 sm:w-72"
                            placeholder="Cari aktivitas..."
                        />
                    </div>
                </div>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.kategori} className="border-border/70">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    {item.kategori}
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {item.jumlah}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <History className="size-5" />
                            Riwayat Aktivitas
                        </CardTitle>
                        <CardDescription>
                            Menampilkan aktivitas terbaru dari modul finansial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead className="bg-muted/60">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">Waktu</th>
                                        <th className="px-3 py-2">Kategori</th>
                                        <th className="px-3 py-2">Aksi</th>
                                        <th className="px-3 py-2">
                                            User / Role
                                        </th>
                                        <th className="px-3 py-2">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((log) => (
                                        <tr key={log.id} className="border-t">
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {log.waktu}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant="outline">
                                                    {log.kategori}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                                {log.aksi}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>{log.user}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {log.role}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {log.detail}
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
                <Skeleton className="h-10 w-72" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-md" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
        </div>
    );
}
