import React from "react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

export interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyMessage?: string;
  rowKey: (item: T) => string | number;
}

export function GenericTable<T>({ data, columns, emptyMessage = "No data found.", rowKey }: GenericTableProps<T>) {
  return (
    <div className="overflow-x-auto w-full scrollbar-hide">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            {columns.map((col) => (
              <th 
                key={col.key} 
                scope="col" 
                className={cn(
                  "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-xs italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={rowKey(item)} 
                className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={cn(
                      "px-4 py-3.5 text-zinc-600 dark:text-zinc-300 transition-colors",
                      col.className
                    )}
                  >
                    {col.cell(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
