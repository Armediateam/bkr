import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { props } = usePage<{ breadcrumbs?: BreadcrumbItem[] }>();
    const resolvedBreadcrumbs =
        props.breadcrumbs && props.breadcrumbs.length > 0
            ? props.breadcrumbs
            : breadcrumbs;

    return (
        <AppLayoutTemplate breadcrumbs={resolvedBreadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
