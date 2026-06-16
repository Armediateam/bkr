import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-3 sm:flex-row",
        month: "relative flex flex-col gap-3",
        month_caption: "mx-6 flex h-8 items-center justify-center",
        caption_label: "text-xs font-medium",
        nav: "contents",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-0 top-0 inline-flex size-6 items-center justify-center bg-transparent p-0 opacity-80 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-0 top-0 inline-flex size-6 items-center justify-center bg-transparent p-0 opacity-80 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-8 rounded-md text-[0.7rem] font-normal",
        week: "mt-1.5 flex w-full",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 text-xs font-normal aria-selected:opacity-100"
        ),
        day_button: "size-8",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", className)} {...iconProps} />
          ) : (
            <ChevronRightIcon
              className={cn("size-4", className)}
              {...iconProps}
            />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
