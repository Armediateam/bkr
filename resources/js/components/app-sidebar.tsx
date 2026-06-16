import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, FolderGit2, FolderOpen, LayoutGrid, UserCog, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, laporan, proyek } from '@/routes';
import type { Auth, NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const mainNavItems: NavItem[] = auth.user.role === 'owner'
        ? [
              {
                  title: 'Dashboard',
                  href: dashboard(),
                  icon: LayoutGrid,
              },
              {
                  title: 'Laporan',
                  href: laporan(),
                  icon: FileText,
              },
              {
                  title: 'Proyek',
                  href: proyek(),
                  icon: FolderOpen,
              },
              {
                  title: 'Product Manager',
                  href: '/dashboard/product-manager',
                  icon: UserCog,
              },
              {
                  title: 'Akun',
                  href: '/dashboard/akun',
                  icon: Users,
              },
          ]
        : [
              {
                  title: 'Dashboard',
                  href: '/product-manager/dashboard',
                  icon: LayoutGrid,
              },
              {
                  title: 'Laporan',
                  href: '/product-manager/laporan',
                  icon: FileText,
              },
          ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={auth.user.role === 'owner' ? dashboard() : '/product-manager/dashboard'}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
