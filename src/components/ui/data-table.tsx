"use client"

import * as React from "react"
import { useTable, type ColumnDef, type RowData, type SortingState, type ColumnFiltersState, type ColumnVisibilityState } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { features, type DataTableFeatures } from "./data-table-features"
import { cn } from "@/app/lib/utils"
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search } from "lucide-react"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  filterColumn?: string
  filterPlaceholder?: string
  searchable?: boolean
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter records...",
  searchable = true
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center justify-between gap-4">
          {filterColumn && (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <Input
                placeholder={filterPlaceholder}
                value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                }
                className="pl-9 bg-white border-[#E4E4E4] text-xs h-10 rounded-none focus-visible:ring-0 focus-visible:border-[#0055FF]"
              />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="ml-auto h-10 rounded-none border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest gap-2" />}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-[#E4E4E4] shadow-xl">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-[10px] font-bold uppercase tracking-wider"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="overflow-hidden rounded-none border border-[#E4E4E4] bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-[#F7F7F5]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-[#E4E4E4]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-4 text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#F7F7F5] transition-colors border-b-[#E4E4E4] last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4 text-[11px] font-medium text-[#0A0A0A]">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                  No records detected.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-[#E4E4E4]"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] px-2">
            Page {table.store.state.pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-[#E4E4E4]"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}