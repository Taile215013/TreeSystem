"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-zinc-950 transition-colors", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10 mb-2",
        caption_label: "text-sm font-bold text-zinc-900 dark:text-zinc-100",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between w-full h-10 pointer-events-none px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 p-0 opacity-100 pointer-events-auto rounded-lg border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 p-0 opacity-100 pointer-events-auto rounded-lg border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full justify-between mb-2",
        weekday: "text-zinc-500 dark:text-zinc-500 size-9 font-bold text-[10px] flex items-center justify-center uppercase tracking-widest",
        week: "flex w-full justify-between mt-1",
        day: "relative p-0 size-9 flex items-center justify-center text-center text-sm",
        day_button: cn(
          "size-full p-0 font-medium transition-all hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300",
          "aria-selected:opacity-100"
        ),
        selected: "bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg",
        today: "text-emerald-600 dark:text-emerald-400 font-black ring-1 ring-emerald-600/30",
        outside: "text-zinc-300 dark:text-zinc-600 opacity-50",
        disabled: "text-zinc-300 dark:text-zinc-600 opacity-50",
        range_middle: "aria-selected:bg-emerald-500/10 aria-selected:text-emerald-600 dark:aria-selected:text-emerald-400",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === "left"
          ? <ChevronLeft className="size-4 text-zinc-600 dark:text-zinc-400" />
          : <ChevronRight className="size-4 text-zinc-600 dark:text-zinc-400" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
