import { Head } from '@inertiajs/react';
import { ProjectTable } from '@/components/projects/project-table';
import type { ProjectRow } from '@/components/projects/project-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { dashboard, proyek } from '@/routes';

export default function Proyek({
    projects,
    productManagers,
}: {
    projects: ProjectRow[];
    productManagers: string[];
}) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return (
            <>
                <Head title="Proyek" />
                <ProjectPageSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title="Proyek" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ProjectTable projects={projects} productManagers={productManagers} />
            </div>
        </>
    );
}

function ProjectPageSkeleton() {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Card className="border-0 py-6 shadow-none">
                <CardHeader className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-full max-w-2xl" />
                    </div>
                    <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
                        <div className="flex w-full flex-col gap-4">
                            <Skeleton className="h-10 w-full max-w-80" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="flex w-full flex-col gap-3 min-[768px]:flex-row min-[1200px]:w-auto">
                            <Skeleton className="h-10 w-full min-[1200px]:w-44" />
                            <Skeleton className="h-10 w-full min-[1200px]:w-36" />
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
                        <Skeleton className="h-4 w-52" />
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

Proyek.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Proyek',
            href: proyek(),
        },
    ],
};
