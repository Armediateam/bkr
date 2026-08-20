import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Construction, FolderSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageSkeleton } from '@/hooks/use-page-skeleton';
import { dashboard } from '@/routes';

type FinanceMenuPlaceholderProps = {
    title: string;
    section: string;
    source: string | null;
    href: string;
};

export default function FinanceMenuPlaceholder({
    title,
    section,
    source,
    href,
}: FinanceMenuPlaceholderProps) {
    const showSkeleton = usePageSkeleton();

    if (showSkeleton) {
        return (
            <>
                <Head title={title} />
                <FinanceMenuPlaceholderSkeleton />
            </>
        );
    }

    return (
        <>
            <Head title={title} />
            <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {section}
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="size-4" />
                            Dashboard
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Construction className="size-5" />
                            Halaman Belum Dipindahkan
                        </CardTitle>
                        <CardDescription>
                            URL dan breadcrumb menu ini sudah disiapkan di
                            Laravel BKR. Isi halaman detail masih menunggu
                            porting manual dari finansial CUSTOM.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm">
                        <div className="grid gap-2 rounded-md border p-3">
                            <div className="flex items-center gap-2 font-medium">
                                <FolderSync className="size-4" />
                                Sumber Python
                            </div>
                            <p className="text-muted-foreground">
                                {source
                                    ? `templates/${source}`
                                    : 'Template sumber belum dipetakan.'}
                            </p>
                        </div>
                        <div className="grid gap-1 rounded-md border p-3">
                            <span className="font-medium">URL Laravel</span>
                            <span className="text-muted-foreground">
                                {href}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function FinanceMenuPlaceholderSkeleton() {
    return (
        <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-56" />
                </div>
                <Skeleton className="h-10 w-full sm:w-32" />
            </div>

            <Card>
                <CardHeader className="space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Skeleton className="h-20 w-full rounded-md" />
                    <Skeleton className="h-20 w-full rounded-md" />
                </CardContent>
            </Card>
        </div>
    );
}

FinanceMenuPlaceholder.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Menu Finansial',
            href: '#',
        },
    ],
};
