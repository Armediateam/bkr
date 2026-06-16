import { cn } from "@/lib/utils"

export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div className={cn("flex min-w-32 items-center gap-3", className)}>
      <div className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-600 transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-muted-foreground w-10 text-right text-xs font-medium">
        {value}%
      </span>
    </div>
  )
}
