import { Head, Link } from '@inertiajs/react';
import { Download, FileText, FolderOpen, Target, TimerReset, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type DashboardStat = {
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    completedProjects: number;
    totalReports: number;
    reportsToday: number;
    averageProgress: number;
};

type StatusBreakdownItem = {
    label: string;
    value: number;
};

type RecentReportItem = {
    id: string;
    tanggal: string;
    namaProyek: string;
    shift: string;
    status: string;
    productManager: string;
};

type ProjectRecapItem = {
    id: string;
    namaProyek: string;
    productManager: string;
    progress: number;
    status: string;
    targetSelesai: string;
    reportCount: number;
    lastReportDate: string;
    lastShift: string;
};

type DashboardProps = {
    stats: DashboardStat;
    statusBreakdown: StatusBreakdownItem[];
    recentReports: RecentReportItem[];
    projectRecap: ProjectRecapItem[];
};

const statCardConfig = [
    {
        key: 'totalProjects',
        title: 'Total Proyek',
        description: 'Semua proyek yang tercatat di sistem.',
        icon: FolderOpen,
    },
    {
        key: 'activeProjects',
        title: 'Proyek Aktif',
        description: 'Proyek yang sedang berjalan saat ini.',
        icon: Target,
    },
    {
        key: 'totalReports',
        title: 'Total Laporan',
        description: 'Semua laporan yang sudah masuk.',
        icon: FileText,
    },
    {
        key: 'averageProgress',
        title: 'Rata-rata Progress',
        description: 'Rerata progress semua proyek.',
        icon: TrendingUp,
        suffix: '%',
    },
] as const;

function statusBadgeClass(status: string): string {
    return cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'Aktif' && 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
        status === 'Perencanaan' && 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
        status === 'Selesai' && 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300',
        status === 'Tertunda' && 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
        !['Aktif', 'Perencanaan', 'Selesai', 'Tertunda'].includes(status) &&
            'bg-slate-500/12 text-slate-600 dark:text-slate-300',
    );
}

export default function Dashboard({ stats, statusBreakdown, recentReports, projectRecap }: DashboardProps) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return (
            <>
                <Head title="Dashboard" />
                <DashboardSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Rekap Owner</h1>
                        <p className="text-muted-foreground max-w-3xl text-sm">
                            Lihat ringkasan proyek dan laporan terbaru langsung dari dashboard. Detail lengkap tetap tersedia di halaman laporan.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                            <Link href="/dashboard/laporan">Buka Semua Laporan</Link>
                        </Button>
                        <Button asChild>
                            <a href="/dashboard/export">
                                <Download className="size-4" />
                                Export Rekap CSV
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCardConfig.map((card) => {
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
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {value}
                                        {'suffix' in card ? card.suffix : ''}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Status Operasional</CardTitle>
                            <CardDescription>
                                Snapshot cepat kondisi proyek dan laporan pada hari ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border p-4">
                                    <p className="text-muted-foreground text-sm">Laporan Hari Ini</p>
                                    <p className="mt-2 text-3xl font-semibold">{stats.reportsToday}</p>
                                </div>
                                <div className="rounded-2xl border p-4">
                                    <p className="text-muted-foreground text-sm">Proyek Tertunda</p>
                                    <p className="mt-2 text-3xl font-semibold">{stats.delayedProjects}</p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {statusBreakdown.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-xl border px-4 py-3">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <span className="text-lg font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Laporan Terbaru</CardTitle>
                            <CardDescription>
                                Rekap laporan terbaru tanpa harus masuk ke halaman laporan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-xl border">
                                <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr] gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
                                    <span>Tanggal</span>
                                    <span>Proyek</span>
                                    <span>Shift</span>
                                    <span>Status</span>
                                </div>
                                {recentReports.length > 0 ? (
                                    recentReports.map((report) => (
                                        <div key={report.id} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr] gap-3 border-b px-4 py-3 text-sm last:border-b-0">
                                            <div>
                                                <p className="font-medium">{report.tanggal}</p>
                                                <p className="text-muted-foreground text-xs">{report.productManager}</p>
                                            </div>
                                            <p className="font-medium">{report.namaProyek}</p>
                                            <p>{report.shift}</p>
                                            <div>
                                                <span className={statusBadgeClass(report.status)}>{report.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        Belum ada laporan masuk.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Rekap Semua Proyek</CardTitle>
                            <CardDescription>
                                Ringkasan seluruh proyek beserta laporan terakhirnya. Detail penuh tetap di halaman laporan dan proyek.
                            </CardDescription>
                        </div>
                        <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                            <TimerReset className="size-4" />
                            Total proyek selesai: {stats.completedProjects}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-xl border">
                            <div className="grid min-w-[980px] grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.9fr_0.9fr_0.8fr] gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
                                <span>Proyek</span>
                                <span>Product Manager</span>
                                <span>Progress</span>
                                <span>Status</span>
                                <span>Laporan Terakhir</span>
                                <span>Shift Terakhir</span>
                                <span>Jumlah Laporan</span>
                            </div>
                            {projectRecap.map((project) => (
                                <div
                                    key={project.id}
                                    className="grid min-w-[980px] grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.9fr_0.9fr_0.8fr] gap-3 border-b px-4 py-3 text-sm last:border-b-0"
                                >
                                    <div>
                                        <p className="font-medium">{project.namaProyek}</p>
                                        <p className="text-muted-foreground text-xs">Target: {project.targetSelesai}</p>
                                    </div>
                                    <p>{project.productManager}</p>
                                    <p className="font-medium">{project.progress}%</p>
                                    <div>
                                        <span className={statusBadgeClass(project.status)}>{project.status}</span>
                                    </div>
                                    <p>{project.lastReportDate}</p>
                                    <p>{project.lastShift}</p>
                                    <p className="font-medium">{project.reportCount}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-44" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="border-border/70">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-28" />
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

            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Card className="border-border/70">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Skeleton className="h-28 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                        </div>
                        <div className="grid gap-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-14 w-full rounded-xl" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-xl border">
                            <Skeleton className="h-11 w-full rounded-none" />
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full rounded-none border-t" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/70">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-xl border">
                        <Skeleton className="h-11 min-w-[980px] rounded-none" />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-16 min-w-[980px] rounded-none border-t" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
