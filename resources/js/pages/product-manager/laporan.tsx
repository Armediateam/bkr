import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ReportTable } from '@/components/reports/report-table';
import type { DailyReportRow, ReportDetailContent } from '@/components/reports/report-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import ReportForm from '@/pages/submission/report-form';

type ProductManagerLaporanProps = {
    reports: DailyReportRow[];
    reportDetails: Record<string, ReportDetailContent>;
    projectOptions: string[];
    projectProgressMap: Record<string, number>;
    today: string;
};

export default function ProductManagerLaporan(props: ProductManagerLaporanProps) {
    const showSkeleton = usePageSkeleton();
    const [open, setOpen] = useState(false);

    if (showSkeleton) {
        return (
            <>
                <Head title="Laporan Product Manager" />
                <ProductManagerReportPageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Laporan Product Manager" />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] sm:max-w-5xl overflow-hidden p-0">
                    <div className="flex max-h-[90vh] flex-col">
                        <div className="border-b px-6 py-5">
                            <DialogHeader>
                                <DialogTitle>Tambah Laporan Harian</DialogTitle>
                                <DialogDescription>
                                    Isi laporan langsung dari dashboard product manager.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                            <ReportForm
                                projectOptions={props.projectOptions}
                                projectProgressMap={props.projectProgressMap}
                                today={props.today}
                                embedded
                                submitUrl="/product-manager/laporan"
                                onSuccess={() => setOpen(false)}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ReportTable
                    reports={props.reports}
                    reportDetails={props.reportDetails}
                    canCreate
                    readOnly
                    onCreate={() => setOpen(true)}
                />
            </div>
        </>
    );
}

function ProductManagerReportPageSkeleton() {
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
                            <Skeleton className="h-10 w-full min-[1200px]:w-40" />
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

ProductManagerLaporan.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/product-manager/dashboard',
        },
        {
            title: 'Laporan',
            href: '/product-manager/laporan',
        },
    ],
};
