import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ReportShift = "Pagi" | "Siang" | "Sore"

const shiftStyles: Record<ReportShift, string> = {
  Pagi:
    "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300",
  Siang:
    "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
  Sore:
    "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300",
}

export function ShiftBadge({ shift }: { shift: ReportShift }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-medium", shiftStyles[shift])}
    >
      {shift}
    </Badge>
  )
}
