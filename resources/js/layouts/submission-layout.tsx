import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes/index';
import type { Auth } from '@/types';

export default function SubmissionLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div className="bg-background min-h-screen">
            <Head title="Submit Laporan" />

            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-sm">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Form Laporan Harian</p>
                            <p className="text-muted-foreground text-sm">
                                Submit laporan proyek di luar dashboard
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="size-4" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={logout()} as="button">
                                Keluar
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-card mb-6 rounded-2xl border px-5 py-4 shadow-sm">
                    <p className="text-muted-foreground text-sm">Login sebagai</p>
                    <p className="font-medium">
                        {auth.user.name} | {auth.user.email}
                    </p>
                </div>

                {children}
            </main>
        </div>
    );
}
