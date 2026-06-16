import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react"
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"

import { ProgressBar } from "@/components/reports/progress-bar"
import { ShiftBadge } from "@/components/reports/shift-badge"
import type { ReportShift } from "@/components/reports/shift-badge"
import { StatusBadge } from "@/components/reports/status-badge"
import type { ReportStatus } from "@/components/reports/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DailyReportRow {
  id: string
  tanggal: string
  nota: string
  namaProyek: string
  shift: ReportShift
  progress: number
  jumlahTukangHariIni: string
  namaTukangIzinPagi: string
  teleponKepalaTukangPagi: "YA" | "BELUM"
  catatanKepalaTukangPagi: string
  prakiraanCuaca: string
  pekerjaanUtamaHariIni: string
  rencanaPekerjaanHariIni: string
  rencanaMaterialHariIni: string
  materialDatangHariIni: string
  cctvJam8: string
  tukangSakitSetengahHari: string
  namaTukangIzinSiang: string
  teleponKepalaTukangSiang: "YA" | "BELUM"
  catatanKepalaTukangSiang: string
  statusPekerjaanSiang: string
  penyebabPekerjaanSiang: string
  statusMaterialDatangSiang: string
  uploadSuratJalan: string
  teleponMaterialLusa: "YA" | "BELUM"
  kebutuhanMaterialLusa: string
  cctvJam10: string
  cctvJam12: string
  teleponKepalaTukangSore: "YA" | "BELUM"
  catatanKepalaTukangSore: string
  statusPekerjaanSore: string
  uploadFotoHasil: string
  penyebabPekerjaanSore: string
  orderMaterialSiang: "YA" | "BELUM"
  materialHarga: string
  fotoNota: string
  kendalaKerjaHariIni: string
  targetUtamaBesok: string
  statusMaterialBesok: string
  cctvJam14: string
  cctvJam16: string
  rincianPengeluaranKas: string
  kasbonTukang: string
  status: ReportStatus
  productManager: string
}

type MorningWorkPlanItem = {
  itemPekerjaan: string
  volume: string
  jumlahPekerja: string
}

type IncomingMaterialItem = {
  material: string
  jumlah: string
  satuan: string
  eta: string
}

type MiddayWorkStatusItem = {
  itemPekerjaan: string
  status: string
  penyebab?: string
}

type MiddayMaterialStatusItem = {
  material: string
  status: string
  suratJalan: string
}

type MaterialOrderItem = {
  material: string
  jumlah: string
  satuan: string
}

type PurchasedMaterialItem = {
  namaBahan: string
  jumlah: string
  hargaSatuan: string
  hargaJumlah: string
}

type CashExpenseItem = {
  namaBahan: string
  jumlah: string
  hargaSatuan: string
  hargaJumlah: string
}

type KasbonItem = {
  namaTukang: string
  jumlahKasbon: string
}

export type ReportDetailContent = {
  pagi: {
    namaTukangIzin: string[]
    rencanaPekerjaan: MorningWorkPlanItem[]
    materialDatang: IncomingMaterialItem[]
  }
  siang: {
    namaTukangIzin: string[]
    statusPekerjaan: MiddayWorkStatusItem[]
    statusMaterial: MiddayMaterialStatusItem[]
    kebutuhanMaterial: MaterialOrderItem[]
  }
  sore: {
    materialDibeli: PurchasedMaterialItem[]
  }
  finance: {
    rincianKas: CashExpenseItem[]
    fotoNota: string
    kasbon: KasbonItem[]
  }
}

const statusOptions: ReportStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "Revision",
  "Mangkrak",
]

const shiftOptions: ReportShift[] = ["Pagi", "Siang", "Sore"]
const shiftTabs = [
  { value: "all", label: "Semua" },
  ...shiftOptions.map((shift) => ({ value: shift, label: shift })),
] as const

function BooleanBadge({ value }: { value: "YA" | "BELUM" }) {
  return (
    <span
      className={[
        "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
        value === "YA"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {value}
    </span>
  )
}

function DetailItem({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  )
}

function DetailDataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-sidebar-border/70">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {headers.map((header) => (
              <TableHead key={header} className="h-10 whitespace-normal px-3 text-xs">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.join("-")}-${index}`} className="hover:bg-transparent">
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={`${headers[cellIndex]}-${cellIndex}`}
                  className="whitespace-normal px-3 py-2.5 text-sm"
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ReportTable({
  reports,
  reportDetails,
  canCreate = false,
  readOnly = false,
  onCreate,
}: {
  reports: DailyReportRow[]
  reportDetails: Record<string, ReportDetailContent>
  canCreate?: boolean
  readOnly?: boolean
  onCreate?: () => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [viewedReport, setViewedReport] = useState<DailyReportRow | null>(null)

  const deferredSearch = useDeferredValue(search)
  const viewedReportDetails = viewedReport ? reportDetails[viewedReport.id] ?? null : null


  const filteredData = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase()

    return reports.filter((item) => {
      const matchesSearch =
        keyword.length === 0 ||
        [
          item.id,
          item.tanggal,
          item.nota,
          item.namaProyek,
          item.jumlahTukangHariIni,
          item.namaTukangIzinPagi,
          item.catatanKepalaTukangPagi,
          item.prakiraanCuaca,
          item.pekerjaanUtamaHariIni,
          item.rencanaPekerjaanHariIni,
          item.rencanaMaterialHariIni,
          item.materialDatangHariIni,
          item.tukangSakitSetengahHari,
          item.namaTukangIzinSiang,
          item.catatanKepalaTukangSiang,
          item.statusPekerjaanSiang,
          item.penyebabPekerjaanSiang,
          item.statusMaterialDatangSiang,
          item.kebutuhanMaterialLusa,
          item.catatanKepalaTukangSore,
          item.statusPekerjaanSore,
          item.materialHarga,
          item.kendalaKerjaHariIni,
          item.targetUtamaBesok,
          item.statusMaterialBesok,
          item.rincianPengeluaranKas,
          item.kasbonTukang,
          item.productManager,
          item.status,
          item.shift,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter
      const matchesShift = shiftFilter === "all" || item.shift === shiftFilter

      return matchesSearch && matchesStatus && matchesShift
    })
  }, [deferredSearch, reports, shiftFilter, statusFilter])

  const columns = useMemo<ColumnDef<DailyReportRow>[]>(
    () => [
      {
        accessorKey: "tanggal",
        header: () => "Tanggal",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.tanggal}</div>
            <div className="text-muted-foreground text-xs">{row.original.id}</div>
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: () => "ID",
        cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
      },
      {
        accessorKey: "namaProyek",
        header: () => "Nama Proyek",
        cell: ({ row }) => (
          <div className="min-w-[220px] max-w-[280px] whitespace-normal font-medium">
            {row.original.namaProyek}
          </div>
        ),
      },
      {
        accessorKey: "shift",
        header: () => "Shift Laporan",
        cell: ({ row }) => <ShiftBadge shift={row.original.shift} />,
      },
      {
        accessorKey: "jumlahTukangHariIni",
        header: () => "Jumlah Tukang Hari Ini",
        cell: ({ row }) => <div className="font-medium">{row.original.jumlahTukangHariIni}</div>,
      },
      {
        accessorKey: "progress",
        header: () => "Progress",
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <ProgressBar value={row.original.progress} />
          </div>
        ),
      },
      {
        accessorKey: "kendalaKerjaHariIni",
        header: () => "Kendala Kerja Hari Ini",
        cell: ({ row }) => (
          <div className="min-w-[240px] max-w-[320px] whitespace-normal text-sm text-muted-foreground">
            {row.original.kendalaKerjaHariIni}
          </div>
        ),
      },
      {
        accessorKey: "productManager",
        header: () => "Product Manager",
      },
      {
        accessorKey: "status",
        header: () => "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="w-12" />,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewedReport(row.original)}>
                  Lihat
                </DropdownMenuItem>
                {!readOnly ? (
                  <>
                    <DropdownMenuItem>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      Hapus
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [readOnly]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  const rows = table.getRowModel().rows
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const start = pageIndex * pageSize
  const end = start + rows.length
  const totalPages = Math.max(table.getPageCount(), 1)
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)

  useEffect(() => {
    table.setPageIndex(0)
  }, [deferredSearch, shiftFilter, statusFilter, table])


  return (
    <>
      <Dialog open={viewedReport !== null} onOpenChange={(open) => !open && setViewedReport(null)}>
        <DialogContent className="max-w-5xl overflow-hidden p-0 sm:max-w-4xl">
          {viewedReport ? (
            <div className="flex max-h-[85vh] flex-col">
              <div className="border-b px-6 py-5">
                <DialogHeader>
                  <DialogTitle>Detail Laporan Harian</DialogTitle>
                  <DialogDescription>
                    {viewedReport.namaProyek} • {viewedReport.tanggal} • {viewedReport.nota}
                  </DialogDescription>
                </DialogHeader>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="grid gap-6 p-6">
                  <section className="grid gap-4 rounded-xl border border-sidebar-border/70 p-5">
                    <h3 className="border-b border-sidebar-border/70 pb-3 font-semibold">Ringkasan</h3>
                    <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                      <DetailItem label="Tanggal">
                        <p className="font-medium">{viewedReport.tanggal}</p>
                      </DetailItem>
                      <DetailItem label="Nama Proyek">
                        <p className="font-medium">{viewedReport.namaProyek}</p>
                      </DetailItem>
                      <DetailItem label="ID Laporan">
                        <p className="font-medium">{viewedReport.id}</p>
                      </DetailItem>
                      <DetailItem label="Shift Laporan">
                        <div className="pt-1">
                          <ShiftBadge shift={viewedReport.shift} />
                        </div>
                      </DetailItem>
                      <DetailItem label="Status">
                        <div className="pt-1">
                          <StatusBadge status={viewedReport.status} />
                        </div>
                      </DetailItem>
                      <DetailItem label="Product Manager">
                        <p className="font-medium">{viewedReport.productManager}</p>
                      </DetailItem>
                      <DetailItem label="Jumlah Tukang Hari Ini">
                        <p className="font-medium">{viewedReport.jumlahTukangHariIni}</p>
                      </DetailItem>
                      <DetailItem label="Progress">
                        <div className="pt-2">
                          <ProgressBar value={viewedReport.progress} />
                        </div>
                      </DetailItem>
                    </div>
                  </section>

                  {viewedReportDetails ? (
                    <>
                      <section className="grid gap-4 rounded-xl border border-sidebar-border/70 p-5">
                        <h3 className="border-b border-sidebar-border/70 pb-3 font-semibold">Laporan Pagi</h3>
                        <div className="grid gap-6">
                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Tanggal / Bulan / Tahun">
                              <p>{viewedReport.tanggal}</p>
                            </DetailItem>
                            <DetailItem label="Nama Proyek">
                              <p>{viewedReport.namaProyek}</p>
                            </DetailItem>
                            <DetailItem label="Jumlah Tukang Hari Ini">
                              <p>{viewedReport.jumlahTukangHariIni}</p>
                            </DetailItem>
                            <DetailItem label="Sudah Telepon Kepala Tukang">
                              <div className="pt-1">
                                <BooleanBadge value={viewedReport.teleponKepalaTukangPagi} />
                              </div>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 1">
                              <p>{viewedReportDetails.pagi.namaTukangIzin[0] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 2">
                              <p>{viewedReportDetails.pagi.namaTukangIzin[1] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 3">
                              <p>{viewedReportDetails.pagi.namaTukangIzin[2] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Prakiraan Cuaca Hari Ini">
                              <p>{viewedReport.prakiraanCuaca}</p>
                            </DetailItem>
                            <DetailItem label="Satu Pekerjaan Utama Hari Ini">
                              <p>{viewedReport.pekerjaanUtamaHariIni}</p>
                            </DetailItem>
                            <DetailItem label="Catatan dari Kepala Tukang" className="md:col-span-2">
                              <p>{viewedReport.catatanKepalaTukangPagi}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Rencana Pekerjaan Hari Ini
                            </p>
                            <DetailDataTable
                              headers={["Item Pekerjaan", "Volume + Satuan", "Jumlah Pekerja"]}
                              rows={viewedReportDetails.pagi.rencanaPekerjaan.map((item) => [
                                item.itemPekerjaan,
                                item.volume,
                                item.jumlahPekerja,
                              ])}
                            />
                          </div>

                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Rencana Material yang Digunakan Hari Ini" className="md:col-span-2">
                              <p>{viewedReport.rencanaMaterialHariIni}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Material yang Akan Datang Hari Ini
                            </p>
                            <DetailDataTable
                              headers={["Material", "Jumlah", "Satuan", "Estimasi Jam Kedatangan (ETA)"]}
                              rows={viewedReportDetails.pagi.materialDatang.map((item) => [
                                item.material,
                                item.jumlah,
                                item.satuan,
                                item.eta,
                              ])}
                            />
                          </div>

                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Upload Capture CCTV Jam 08.00">
                              <p>{viewedReport.cctvJam8}</p>
                            </DetailItem>
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4 rounded-xl border border-sidebar-border/70 p-5">
                        <h3 className="border-b border-sidebar-border/70 pb-3 font-semibold">Laporan Siang</h3>
                        <div className="grid gap-6">
                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Tanggal / Bulan / Tahun">
                              <p>{viewedReport.tanggal}</p>
                            </DetailItem>
                            <DetailItem label="Nama Proyek">
                              <p>{viewedReport.namaProyek}</p>
                            </DetailItem>
                            <DetailItem label="Tukang Sakit / Pulang Setengah Hari">
                              <p>{viewedReport.tukangSakitSetengahHari}</p>
                            </DetailItem>
                            <DetailItem label="Sudah Telepon Kepala Tukang Menanyakan Status Pekerjaan">
                              <div className="pt-1">
                                <BooleanBadge value={viewedReport.teleponKepalaTukangSiang} />
                              </div>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 1">
                              <p>{viewedReportDetails.siang.namaTukangIzin[0] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 2">
                              <p>{viewedReportDetails.siang.namaTukangIzin[1] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Nama Tukang Izin 3">
                              <p>{viewedReportDetails.siang.namaTukangIzin[2] ?? "-"}</p>
                            </DetailItem>
                            <DetailItem label="Upload Capture CCTV Jam 10.00">
                              <p>{viewedReport.cctvJam10}</p>
                            </DetailItem>
                            <DetailItem label="Catatan dari Kepala Tukang" className="md:col-span-2">
                              <p>{viewedReport.catatanKepalaTukangSiang}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Status Item Pekerjaan Pendukung
                            </p>
                            <DetailDataTable
                              headers={["Item Pekerjaan", "Status", "Penyebab Jika < 50% / Mangkrak"]}
                              rows={viewedReportDetails.siang.statusPekerjaan.map((item) => [
                                item.itemPekerjaan,
                                item.status,
                                item.penyebab ?? "-",
                              ])}
                            />
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Status Item Material yang Datang Hari Ini
                            </p>
                            <DetailDataTable
                              headers={["Material", "Status", "Upload Foto Surat Jalan"]}
                              rows={viewedReportDetails.siang.statusMaterial.map((item) => [
                                item.material,
                                item.status,
                                item.suratJalan,
                              ])}
                            />
                          </div>

                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Sudah Telepon Kepala Tukang Menanyakan Kebutuhan Material untuk Lusa">
                              <div className="pt-1">
                                <BooleanBadge value={viewedReport.teleponMaterialLusa} />
                              </div>
                            </DetailItem>
                            <DetailItem label="Upload Capture CCTV Jam 12.00">
                              <p>{viewedReport.cctvJam12}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Kebutuhan Material yang Dipesan Siang Ini
                            </p>
                            <DetailDataTable
                              headers={["Material", "Jumlah", "Satuan"]}
                              rows={viewedReportDetails.siang.kebutuhanMaterial.map((item) => [
                                item.material,
                                item.jumlah,
                                item.satuan,
                              ])}
                            />
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4 rounded-xl border border-sidebar-border/70 p-5">
                        <h3 className="border-b border-sidebar-border/70 pb-3 font-semibold">Laporan Sore</h3>
                        <div className="grid gap-6">
                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Tanggal / Bulan / Tahun">
                              <p>{viewedReport.tanggal}</p>
                            </DetailItem>
                            <DetailItem label="Nama Proyek">
                              <p>{viewedReport.namaProyek}</p>
                            </DetailItem>
                            <DetailItem label="Sudah Telepon Kepala Tukang Menanyakan Status Pekerjaan">
                              <div className="pt-1">
                                <BooleanBadge value={viewedReport.teleponKepalaTukangSore} />
                              </div>
                            </DetailItem>
                            <DetailItem label="Status Item Pekerjaan Pendukung">
                              <p>{viewedReport.statusPekerjaanSore}</p>
                            </DetailItem>
                            <DetailItem label="Upload Foto Masing-Masing Hasil Pekerjaan">
                              <p>{viewedReport.uploadFotoHasil}</p>
                            </DetailItem>
                            <DetailItem label="Foto Nota">
                              <p>{viewedReport.fotoNota}</p>
                            </DetailItem>
                            <DetailItem label="Catatan dari Kepala Tukang" className="md:col-span-2">
                              <p>{viewedReport.catatanKepalaTukangSore}</p>
                            </DetailItem>
                            <DetailItem label="Penyebab Utama Jika Pekerjaan Belum Selesai" className="md:col-span-2">
                              <p>{viewedReport.penyebabPekerjaanSore}</p>
                            </DetailItem>
                            <DetailItem label="Sudah Order Seluruh Material yang Ditulis Siang Tadi?">
                              <div className="pt-1">
                                <BooleanBadge value={viewedReport.orderMaterialSiang} />
                              </div>
                            </DetailItem>
                            <DetailItem label="Status Material untuk Pekerjaan Besok">
                              <p>{viewedReport.statusMaterialBesok}</p>
                            </DetailItem>
                            <DetailItem label="Kendala Kerja Hari Ini" className="md:col-span-2">
                              <p>{viewedReport.kendalaKerjaHariIni}</p>
                            </DetailItem>
                            <DetailItem label="Target Utama Pekerjaan Besok" className="md:col-span-2">
                              <p>{viewedReport.targetUtamaBesok}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">
                              Nama Material + Jumlah + Harga Satuan + Harga Jumlah
                            </p>
                            <DetailDataTable
                              headers={["Nama Bahan / Alat", "Jumlah", "Harga Satuan", "Harga Jumlah"]}
                              rows={viewedReportDetails.sore.materialDibeli.map((item) => [
                                item.namaBahan,
                                item.jumlah,
                                item.hargaSatuan,
                                item.hargaJumlah,
                              ])}
                            />
                          </div>

                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Upload Capture CCTV Jam 14.00">
                              <p>{viewedReport.cctvJam14}</p>
                            </DetailItem>
                            <DetailItem label="Upload Capture CCTV Jam 16.00">
                              <p>{viewedReport.cctvJam16}</p>
                            </DetailItem>
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4 rounded-xl border border-sidebar-border/70 p-5">
                        <h3 className="border-b border-sidebar-border/70 pb-3 font-semibold">Finance dan Cash</h3>
                        <div className="grid gap-6">
                          <div className="grid gap-3">
                            <p className="text-sm font-medium">Rincian Pengeluaran Kas</p>
                            <DetailDataTable
                              headers={["Nama Bahan / Alat", "Jumlah", "Harga Satuan", "Harga Jumlah"]}
                              rows={viewedReportDetails.finance.rincianKas.map((item) => [
                                item.namaBahan,
                                item.jumlah,
                                item.hargaSatuan,
                                item.hargaJumlah,
                              ])}
                            />
                          </div>

                          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                            <DetailItem label="Upload Foto Nota">
                              <p>{viewedReportDetails.finance.fotoNota}</p>
                            </DetailItem>
                          </div>

                          <div className="grid gap-3">
                            <p className="text-sm font-medium">Kasbon Tukang</p>
                            <DetailDataTable
                              headers={["Nama Tukang", "Jumlah Kasbon"]}
                              rows={
                                viewedReportDetails.finance.kasbon.length > 0
                                  ? viewedReportDetails.finance.kasbon.map((item) => [
                                      item.namaTukang,
                                      item.jumlahKasbon,
                                    ])
                                  : [["-", "-"]]
                              }
                            />
                          </div>
                        </div>
                      </section>
                    </>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Card className="border-0 py-6 shadow-none">
        <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle>Laporan Harian Konstruksi</CardTitle>
          <CardDescription className="max-w-2xl">
            Pantau progres harian proyek, ketersediaan material, dan kendala
            lapangan dalam satu tabel operasional yang rapi dan responsif.
          </CardDescription>
        </div>

        <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
          <div className="flex w-full flex-col gap-4 min-[1200px]:min-w-0 min-[1200px]:flex-1 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:gap-6">
            <div className="flex min-w-0 flex-col gap-4 min-[768px]:flex-row min-[768px]:items-stretch min-[768px]:gap-6 min-[1200px]:items-center">
                <div className="relative w-full min-[768px]:min-w-0 min-[768px]:flex-1 min-[1200px]:max-w-80 min-[1200px]:shrink-0 min-[1200px]:flex-none">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      const nextValue = event.target.value

                      startTransition(() => setSearch(nextValue))
                    }}
                    placeholder="Cari proyek, nota, pekerjaan, material, atau PM..."
                    className="w-full pl-9"
                  />
                </div>

                <div className="min-w-0 flex-1 overflow-x-auto min-[1200px]:overflow-visible">
                  <div className="border-border grid w-full min-w-full grid-cols-4 border-b min-[1200px]:inline-flex min-[1200px]:w-auto min-[1200px]:min-w-max min-[1200px]:grid-cols-none min-[1200px]:gap-6">
                    {shiftTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        className={[
                          "text-muted-foreground inline-flex w-full justify-center whitespace-nowrap border-b-2 px-2 py-3 text-sm font-medium transition-colors min-[1200px]:w-auto min-[1200px]:justify-start min-[1200px]:px-0",
                          shiftFilter === tab.value
                            ? "border-foreground text-foreground"
                            : "border-transparent hover:text-foreground",
                        ].join(" ")}
                        onClick={() => setShiftFilter(tab.value)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
          </div>

          <div className="flex w-full flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-end min-[768px]:gap-4 min-[1200px]:w-auto min-[1200px]:shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full min-[1200px]:w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">Semua status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canCreate && onCreate ? (
              <Button
                type="button"
                className="w-full min-[1200px]:w-auto min-[1200px]:shrink-0"
                onClick={onCreate}
              >
                <Plus className="size-4" />
                Tambah Laporan
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-sidebar-border/70">
          <ScrollArea className="w-full whitespace-nowrap">
            <Table className="min-w-[1500px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                      <div className="mx-auto max-w-md space-y-3">
                        <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
                          <Search className="text-muted-foreground size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">Data laporan tidak ditemukan</p>
                          <p className="text-muted-foreground text-sm">
                            Ubah kata kunci pencarian atau reset filter proyek,
                            status, dan shift untuk melihat data kembali.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <div className="flex flex-col items-center gap-3 text-center text-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-muted-foreground">
            Menampilkan {filteredData.length === 0 ? 0 : start + 1} sampai {end} dari{" "}
            {filteredData.length} laporan
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <div className="flex items-center justify-center gap-2">
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={page === pageIndex + 1 ? "default" : "outline"}
                  size="sm"
                  className="min-w-9"
                  onClick={() => table.setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </>
  )
}

