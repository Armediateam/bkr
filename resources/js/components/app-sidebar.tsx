import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BadgeDollarSign,
    BookOpen,
    Boxes,
    Building2,
    Calculator,
    ChartColumn,
    ChartPie,
    CircleDollarSign,
    Factory,
    FileClock,
    FileText,
    Flag,
    FolderOpen,
    Gauge,
    Handshake,
    History,
    IdCard,
    Landmark,
    LayoutGrid,
    ListChecks,
    ReceiptText,
    RefreshCw,
    RotateCcw,
    Scale,
    Settings,
    ShoppingCart,
    Store,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    Truck,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const financeHref = (path: string) => `/dashboard/${path}`;
    const ownerNavGroups: { label: string; items: NavItem[] }[] = [
        {
            label: 'Platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
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
                {
                    title: 'Pengaturan',
                    href: '/settings',
                    icon: Settings,
                },
            ],
        },
        {
            label: 'Input Transaksi',
            items: [
                {
                    title: 'Penjualan',
                    href: financeHref('pemasukan'),
                    icon: TrendingUp,
                },
                {
                    title: 'Pembelian',
                    href: financeHref('pembelian'),
                    icon: ShoppingCart,
                },
                {
                    title: 'Pengeluaran',
                    href: financeHref('pengeluaran'),
                    icon: TrendingDown,
                },
                {
                    title: 'Retur',
                    href: financeHref('retur-penjualan'),
                    icon: RotateCcw,
                },
                {
                    title: 'Pelunasan',
                    href: financeHref('pelunasan'),
                    icon: Handshake,
                },
                {
                    title: 'Transfer Rekening',
                    href: financeHref('transfer-rekening'),
                    icon: ArrowLeftRight,
                },
                {
                    title: 'Pendanaan',
                    href: financeHref('pendanaan'),
                    icon: CircleDollarSign,
                },
                {
                    title: 'Import Marketplace',
                    href: financeHref('import-marketplace'),
                    icon: Store,
                },
            ],
        },
        {
            label: 'POS',
            items: [
                {
                    title: 'POS Kasir',
                    href: financeHref('pos'),
                    icon: Calculator,
                },
                {
                    title: 'Master POS',
                    href: financeHref('pos/master'),
                    icon: ChartPie,
                },
            ],
        },
        {
            label: 'Dokumen',
            items: [
                {
                    title: 'Invoice',
                    href: financeHref('invoice'),
                    icon: FileText,
                },
                {
                    title: 'Purchase Order',
                    href: financeHref('po'),
                    icon: ShoppingCart,
                },
            ],
        },
        {
            label: 'Operasional',
            items: [
                { title: 'Proyek', href: proyek(), icon: FolderOpen },
                {
                    title: 'Customer',
                    href: financeHref('database/customer'),
                    icon: Users,
                },
                {
                    title: 'Vendor',
                    href: financeHref('database/vendor'),
                    icon: Truck,
                },
                { title: 'Inventory', href: financeHref('stok'), icon: Boxes },
                {
                    title: 'Produksi',
                    href: financeHref('produksi'),
                    icon: Factory,
                },
                {
                    title: 'Master HPP',
                    href: financeHref('kalkulator-hpp'),
                    icon: Calculator,
                },
            ],
        },
        {
            label: 'Monitoring',
            items: [
                {
                    title: 'Daftar Transaksi',
                    href: financeHref('daftar-transaksi'),
                    icon: ListChecks,
                },
                {
                    title: 'Piutang',
                    href: financeHref('piutang'),
                    icon: BadgeDollarSign,
                },
                {
                    title: 'Hutang',
                    href: financeHref('hutang'),
                    icon: Landmark,
                },
                {
                    title: 'Jurnal',
                    href: financeHref('transaksi'),
                    icon: ReceiptText,
                },
                {
                    title: 'Log Aktivitas',
                    href: financeHref('log'),
                    icon: History,
                },
            ],
        },
        {
            label: 'Laporan',
            items: [
                { title: 'Laporan Harian', href: laporan(), icon: FileText },
                {
                    title: 'Laba Rugi',
                    href: financeHref('laba-rugi'),
                    icon: ChartColumn,
                },
                {
                    title: 'Arus Kas',
                    href: financeHref('arus-kas'),
                    icon: TrendingUp,
                },
                { title: 'Neraca', href: financeHref('neraca'), icon: Scale },
                {
                    title: 'Perubahan Ekuitas',
                    href: financeHref('perubahan-ekuitas'),
                    icon: RefreshCw,
                },
                {
                    title: 'Analisis Rasio',
                    href: financeHref('analisis-rasio'),
                    icon: Gauge,
                },
                {
                    title: 'Buku Besar',
                    href: financeHref('buku-besar'),
                    icon: BookOpen,
                },
                {
                    title: 'Performa Penjualan',
                    href: financeHref('performa-penjualan'),
                    icon: Trophy,
                },
                {
                    title: 'Grafik',
                    href: financeHref('charts'),
                    icon: ChartPie,
                },
                {
                    title: 'Aset Tetap',
                    href: financeHref('aset-tetap'),
                    icon: Building2,
                },
            ],
        },
        {
            label: 'Akuntansi',
            items: [
                {
                    title: 'Bagan Akun',
                    href: financeHref('bagan-akun'),
                    icon: ListChecks,
                },
                {
                    title: 'Setup Saldo Awal',
                    href: financeHref('setup/saldo-awal'),
                    icon: Flag,
                },
            ],
        },
        {
            label: 'Pajak',
            items: [
                { title: 'Hub Pajak', href: financeHref('pajak'), icon: Gauge },
                {
                    title: 'Bayar Pajak/Gaji',
                    href: financeHref('pajak/setor'),
                    icon: ArrowLeftRight,
                },
                {
                    title: 'Pembelian PKP',
                    href: financeHref('pajak/pembelian-pkp'),
                    icon: ShoppingCart,
                },
                {
                    title: 'SPT Masa PPN',
                    href: financeHref('pajak/spt-masa'),
                    icon: FileText,
                },
                {
                    title: 'Rekap PPh 22',
                    href: financeHref('pajak/pph22'),
                    icon: Landmark,
                },
                {
                    title: 'Bukti Potong PPh23',
                    href: financeHref('pajak/bukti-potong'),
                    icon: FileText,
                },
                {
                    title: 'Bukti Potong Keluar',
                    href: financeHref('pajak/bukti-potong-keluar'),
                    icon: FileText,
                },
                {
                    title: 'Bukti Bayar Pajak',
                    href: financeHref('pajak/bukti-bayar'),
                    icon: ReceiptText,
                },
            ],
        },
        {
            label: 'Gaji',
            items: [
                {
                    title: 'Data Karyawan',
                    href: financeHref('gaji/karyawan'),
                    icon: IdCard,
                },
                {
                    title: 'Proses Gaji',
                    href: financeHref('gaji/proses'),
                    icon: Calculator,
                },
                {
                    title: 'Riwayat Gaji',
                    href: financeHref('gaji/riwayat'),
                    icon: FileClock,
                },
            ],
        },
        {
            label: 'Anggaran',
            items: [
                {
                    title: 'Anggaran & Target',
                    href: financeHref('anggaran'),
                    icon: Target,
                },
            ],
        },
        {
            label: 'Modul',
            items: [
                {
                    title: 'Modul Lanjutan',
                    href: financeHref('pengaturan/modul'),
                    icon: Gauge,
                },
            ],
        },
    ];
    const productManagerNavItems: NavItem[] = [
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
                                href={
                                    auth.user.role === 'owner'
                                        ? dashboard()
                                        : '/product-manager/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {auth.user.role === 'owner' ? (
                    ownerNavGroups.map((group) => (
                        <NavMain
                            key={group.label}
                            label={group.label}
                            items={group.items}
                        />
                    ))
                ) : (
                    <NavMain items={productManagerNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
