import { Head, Link } from '@inertiajs/react';
import { ClipboardList, FolderOpen, LayoutGrid, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';

type ProductManagerDashboardProps = {
    stats: {
        totalReports: number;
        reportsThisMonth: number;
        assignedProjects: number;
        latestReportDate: string | null;
    };
};

const statCards = [
    {
        key: 'totalReports',
        title: 'Total Laporan',
        description: 'Semua laporan yang pernah Anda kirim.',
        icon: ClipboardList,
    },
    {
        key: 'reportsThisMonth',
        title: 'Laporan Bulan Ini',
        description: 'Jumlah laporan yang masuk pada bulan berjalan.',
        icon: TrendingUp,
    },
    {
        key: 'assignedProjects',
        title: 'Proyek Ditangani',
        description: 'Proyek yang saat ini tercatat atas nama Anda.',
        icon: FolderOpen,
    },
] as const;

export default function ProductManagerDashboard({ stats }: ProductManagerDashboardProps) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return (
            <>
                <Head title="Dashboard Product Manager" />
                <ProductManagerDashboardSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard Product Manager" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="grid gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard Product Manager</h1>
                    <p className="text-muted-foreground max-w-3xl text-sm">
                        Pantau ringkasan laporan Anda dan lanjutkan ke halaman laporan untuk menambah laporan baru.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        const value = stats[card.key];

                        return (
                            <Card key={card.key} className="border-border/70">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{card.title}</CardTitle>
                                        <CardDescription>{card.description}</CardDescription>
                                    </div>
                                    <div className="bg-primary/10 text-primary rounded-xl p-2">
                                        <Icon className="size-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-semibold tracking-tight">{value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Aktivitas Laporan</CardTitle>
                            <CardDescription>
                                Status terakhir laporan Anda tercatat per tanggal submit terakhir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl border border-dashed p-5">
                                <p className="text-sm font-medium">Laporan terakhir</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {stats.latestReportDate ?? 'Belum ada laporan'}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Jika belum ada laporan, langsung tambah dari halaman laporan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Akses Cepat</CardTitle>
                            <CardDescription>
                                Buka halaman laporan untuk melihat histori dan menambahkan laporan baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href="/product-manager/laporan"
                                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                            >
                                <LayoutGrid className="size-4" />
                                Buka Halaman Laporan
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function ProductManagerDashboardSkeleton() {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
            <div className="grid gap-2">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="border-border/70">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="size-10 rounded-xl" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-9 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <Card className="border-border/70">
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-36 w-full rounded-2xl" />
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-48 rounded-xl" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

ProductManagerDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/product-manager/dashboard',
        },
    ],
};
