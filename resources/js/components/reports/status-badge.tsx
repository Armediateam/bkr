import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ReportStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "Revision"
  | "Mangkrak"

const statusStyles: Record<ReportStatus, string> = {
  Draft:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  Submitted:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  Approved:
    "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  Revision:
    "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  Mangkrak:
    "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-medium", statusStyles[status])}
    >
      {status}
    </Badge>
  )
}
