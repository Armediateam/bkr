import { Head } from '@inertiajs/react';
import { ReportTable } from '@/components/reports/report-table';
import type { DailyReportRow, ReportDetailContent } from '@/components/reports/report-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { dashboard, laporan } from '@/routes';

export default function Laporan({
    reports,
    reportDetails,
}: {
    reports: DailyReportRow[];
    reportDetails: Record<string, ReportDetailContent>;
}) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return (
            <>
                <Head title="Laporan" />
                <ReportPageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Laporan" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ReportTable reports={reports} reportDetails={reportDetails} />
            </div>
        </>
    );
}

function ReportPageSkeleton() {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Card className="border-0 py-6 shadow-none">
                <CardHeader className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-56" />
                        <Skeleton className="h-4 w-full max-w-2xl" />
                    </div>
                    <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
                        <div className="flex w-full flex-col gap-4">
                            <Skeleton className="h-10 w-full max-w-80" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="flex w-full flex-col gap-3 min-[768px]:flex-row min-[1200px]:w-auto">
                            <Skeleton className="h-10 w-full min-[1200px]:w-44" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-sidebar-border/70">
                        <Skeleton className="h-12 w-full rounded-none" />
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-16 w-full rounded-none border-t" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Skeleton className="h-4 w-56" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-36" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

Laporan.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan',
            href: laporan(),
        },
    ],
};
