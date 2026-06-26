import { useForm, usePage } from "@inertiajs/react"
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
  DialogFooter,
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
import { Label } from "@/components/ui/label"
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
import type { Auth, Flash } from "@/types"

export type ProjectStatus = "Aktif" | "Perencanaan" | "Selesai" | "Tertunda"

type ProjectStage = "Semua" | ProjectStatus

export type ProjectRow = {
  id: string
  namaProyek: string
  lokasi: string
  client: string
  productManager: string
  targetSelesai: string
  progress: number
  status: ProjectStatus
  nilaiKontrak: string
}

const projectTabs: { label: string; value: ProjectStage }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Aktif", value: "Aktif" },
  { label: "Perencanaan", value: "Perencanaan" },
  { label: "Selesai", value: "Selesai" },
]

const projectStatusOptions: ProjectStatus[] = [
  "Aktif",
  "Perencanaan",
  "Selesai",
  "Tertunda",
]

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Aktif: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    Perencanaan: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    Selesai: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
    Tertunda: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  }

  return (
    <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[status]].join(" ")}>
      {status}
    </span>
  )
}

export function ProjectTable({
  projects,
  productManagers = [],
}: {
  projects: ProjectRow[]
  productManagers?: string[]
}) {
  const { auth, flash } = usePage<{ auth: Auth; flash: Flash }>().props
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState<ProjectStage>("Semua")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const form = useForm({
    namaProyek: "",
    lokasi: "",
    client: "",
    productManager: "",
    targetSelesai: "",
    progress: "0",
    status: "Perencanaan" as ProjectStatus,
    nilaiKontrak: "",
  })

  const deferredSearch = useDeferredValue(search)




  const filteredData = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase()

    return projects.filter((item) => {
      const matchesSearch =
        keyword.length === 0 ||
        [
          item.id,
          item.namaProyek,
          item.lokasi,
          item.client,
          item.productManager,
          item.targetSelesai,
          item.nilaiKontrak,
          item.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)

      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesStage = stageFilter === "Semua" || item.status === stageFilter

      return matchesSearch && matchesStatus && matchesStage
    })
  }, [deferredSearch, projects, stageFilter, statusFilter])

  const columns = useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => "ID Proyek",
        cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
      },
      {
        accessorKey: "namaProyek",
        header: () => "Nama Proyek",
      },
      {
        accessorKey: "lokasi",
        header: () => "Lokasi",
      },
      {
        accessorKey: "client",
        header: () => "Client",
      },
      {
        accessorKey: "productManager",
        header: () => "Product Manager",
      },
      {
        accessorKey: "targetSelesai",
        header: () => "Target Selesai",
      },
      {
        accessorKey: "nilaiKontrak",
        header: () => "Nilai Kontrak",
      },
      {
        accessorKey: "progress",
        header: () => "Progress",
        cell: ({ row }) => (
          <div className="min-w-40">
            <ProgressBar value={row.original.progress} />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => "Status",
        cell: ({ row }) => <ProjectStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: () => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Lihat</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Arsipkan</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  })

  const rows = table.getRowModel().rows
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalPages = table.getPageCount()
  const start = pageIndex * pageSize
  const end = Math.min(start + pageSize, filteredData.length)

  useEffect(() => {
    table.setPageIndex(0)
  }, [deferredSearch, stageFilter, statusFilter])

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages, pageIndex + 1, pageIndex, pageIndex + 2])

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((left, right) => left - right)
  }, [pageIndex, totalPages])


  return (
    <Card className="border-0 py-6 shadow-none">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle>Daftar Proyek</CardTitle>
          <CardDescription className="max-w-2xl">
            Kelola proyek aktif, perencanaan, hingga proyek selesai dalam tabel operasional yang rapi dan mudah dipindai.
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
                  placeholder="Cari proyek, lokasi, client, atau PM..."
                  className="w-full pl-9"
                />
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto min-[1200px]:overflow-visible">
                <div className="border-border grid w-full min-w-full grid-cols-4 border-b min-[1200px]:inline-flex min-[1200px]:w-auto min-[1200px]:min-w-max min-[1200px]:grid-cols-none min-[1200px]:gap-6">
                  {projectTabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      className={[
                        "text-muted-foreground inline-flex w-full justify-center whitespace-nowrap border-b-2 px-2 py-3 text-sm font-medium transition-colors min-[1200px]:w-auto min-[1200px]:justify-start min-[1200px]:px-0",
                        stageFilter === tab.value
                          ? "border-foreground text-foreground"
                          : "border-transparent hover:text-foreground",
                      ].join(" ")}
                      onClick={() => setStageFilter(tab.value)}
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
                {projectStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {auth.user.role === "owner" ? (
              <Button
                type="button"
                className="w-full min-[1200px]:w-auto min-[1200px]:shrink-0"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="size-4" />
                Tambah Proyek
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-sidebar-border/70">
          <ScrollArea className="w-full whitespace-nowrap">
            <Table className="min-w-[1200px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                          <p className="font-semibold">Data proyek tidak ditemukan</p>
                          <p className="text-muted-foreground text-sm">
                            Ubah pencarian atau reset filter status untuk melihat daftar proyek kembali.
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
            Menampilkan {filteredData.length === 0 ? 0 : start + 1} sampai {end} dari {filteredData.length} proyek
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Proyek</DialogTitle>
            <DialogDescription>
              Proyek yang ditambahkan di sini akan otomatis muncul di halaman proyek dan combobox form laporan.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              form.post("/dashboard/proyek", {
                onSuccess: () => {
                  setIsCreateDialogOpen(false)
                  form.reset()
                },
              })
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="namaProyek">Nama Proyek</Label>
              <Input
                id="namaProyek"
                value={form.data.namaProyek}
                onChange={(event) => form.setData("namaProyek", event.target.value)}
                placeholder="Nama proyek"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  value={form.data.lokasi}
                  onChange={(event) => form.setData("lokasi", event.target.value)}
                  placeholder="Lokasi proyek"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={form.data.client}
                  onChange={(event) => form.setData("client", event.target.value)}
                  placeholder="Nama client"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Product Manager</Label>
                <Select
                  value={form.data.productManager}
                  onValueChange={(value) => form.setData("productManager", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih product manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {productManagers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetSelesai">Target Selesai</Label>
                <Input
                  id="targetSelesai"
                  type="date"
                  value={form.data.targetSelesai}
                  onChange={(event) => form.setData("targetSelesai", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="progress">Progress</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={form.data.progress}
                  onChange={(event) => form.setData("progress", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.data.status}
                  onValueChange={(value) => form.setData("status", value as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nilaiKontrak">Nilai Kontrak</Label>
                <Input
                  id="nilaiKontrak"
                  value={form.data.nilaiKontrak}
                  onChange={(event) => form.setData("nilaiKontrak", event.target.value)}
                  placeholder="Rp 0"
                />
              </div>
            </div>

            {(form.errors.namaProyek ||
              form.errors.lokasi ||
              form.errors.client ||
              form.errors.productManager ||
              form.errors.targetSelesai ||
              form.errors.progress ||
              form.errors.status ||
              form.errors.nilaiKontrak) ? (
              <div className="text-sm text-red-500">
                {form.errors.namaProyek ||
                  form.errors.lokasi ||
                  form.errors.client ||
                  form.errors.productManager ||
                  form.errors.targetSelesai ||
                  form.errors.progress ||
                  form.errors.status ||
                  form.errors.nilaiKontrak}
              </div>
            ) : null}

            {flash.success ? (
              <div className="text-sm text-emerald-600 dark:text-emerald-400">{flash.success}</div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.processing}>
                Simpan Proyek
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

