import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
  type RowSelectionState,
  type OnChangeFn,
  type Row,
} from "@tanstack/react-table"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/lib/utils"

// ============================================================================
// Table Container Variants
// ============================================================================

const tableContainerVariants = cva(
  "w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm",
  {
    variants: {
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "",
      striped: "[&_tbody_tr:nth-child(even)]:bg-[#F9FAFB]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// ============================================================================
// Interfaces
// ============================================================================

export interface ITableProps<TData>
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableContainerVariants>,
    VariantProps<typeof tableVariants> {
  /** 테이블에 표시할 데이터 배열 */
  data: TData[]
  /** 컬럼 정의 배열 */
  columns: ColumnDef<TData, unknown>[]
  /** 정렬 상태 (제어 컴포넌트로 사용 시) */
  sorting?: SortingState
  /** 정렬 상태 변경 핸들러 */
  onSortingChange?: OnChangeFn<SortingState>
  /** 페이지네이션 상태 */
  pagination?: PaginationState
  /** 페이지네이션 상태 변경 핸들러 */
  onPaginationChange?: OnChangeFn<PaginationState>
  /** 전체 행 수 (서버 사이드 페이지네이션 시 필요) */
  rowCount?: number
  /** 페이지네이션 활성화 여부 */
  enablePagination?: boolean
  /** 행 선택 활성화 여부 */
  enableRowSelection?: boolean
  /** 선택된 행 상태 */
  rowSelection?: RowSelectionState
  /** 행 선택 상태 변경 핸들러 */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** 글로벌 필터 값 */
  globalFilter?: string
  /** 글로벌 필터 변경 핸들러 */
  onGlobalFilterChange?: OnChangeFn<string>
  /** 컬럼 필터 상태 */
  columnFilters?: ColumnFiltersState
  /** 컬럼 필터 상태 변경 핸들러 */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  /** 로딩 상태 */
  isLoading?: boolean
  /** 빈 상태 메시지 */
  emptyMessage?: string
  /** 행 클릭 핸들러 */
  onRowClick?: (row: Row<TData>) => void
  /** 페이지 사이즈 옵션 */
  pageSizeOptions?: number[]
  /** 테이블 caption */
  caption?: string
}

// ============================================================================
// Basic Table Elements (Unstyled primitives)
// ============================================================================

const TableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
))
TableRoot.displayName = "TableRoot"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-[#F9FAFB] [&_tr]:border-b", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-[#F9FAFB] font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB] data-[state=selected]:bg-[#EFF6FF]",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-semibold text-[#374151] [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle text-[#4B5563] [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-[#6B7280]", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// ============================================================================
// Sort Header Component
// ============================================================================

interface ISortHeaderProps {
  title: string
  isSorted: false | "asc" | "desc"
  canSort: boolean
  onSort: () => void
}

const SortHeader: React.FC<ISortHeaderProps> = ({
  title,
  isSorted,
  canSort,
  onSort,
}) => {
  if (!canSort) {
    return <span>{title}</span>
  }

  return (
    <button
      type="button"
      onClick={onSort}
      className="flex items-center gap-1 hover:text-[#111827] transition-colors"
    >
      <span>{title}</span>
      <span className="w-4 h-4 flex items-center justify-center">
        {isSorted === "asc" ? (
          <ChevronUp className="w-4 h-4" />
        ) : isSorted === "desc" ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronsUpDown className="w-4 h-4 text-[#9CA3AF]" />
        )}
      </span>
    </button>
  )
}

// ============================================================================
// Pagination Component
// ============================================================================

interface IPaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  pageSizeOptions: number[]
}

function Pagination<TData>({ table, pageSizeOptions }: IPaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3 border-t border-[#E5E7EB] bg-white">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7280]">
        <span className="whitespace-nowrap">페이지당</span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="h-7 sm:h-8 px-2 rounded border border-[#D1D5DB] bg-white text-[#374151] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap">행</span>
      </div>

      {/* Page Info */}
      <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-6">
        {/* Page Navigation */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="첫 페이지"
          >
            <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>

          <span className="px-2 sm:px-3 text-xs sm:text-sm text-[#374151] whitespace-nowrap">
            {pageIndex + 1} / {pageCount || 1}
          </span>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="마지막 페이지"
          >
            <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC<{ columnCount: number; rowCount?: number }> = ({
  columnCount,
  rowCount = 5,
}) => (
  <>
    {Array.from({ length: rowCount }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columnCount }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <div className="h-4 bg-[#E5E7EB] rounded animate-pulse" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ columnCount: number; message: string }> = ({
  columnCount,
  message,
}) => (
  <TableRow>
    <TableCell colSpan={columnCount} className="h-24 text-center">
      <div className="flex flex-col items-center justify-center gap-2 text-[#9CA3AF]">
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <span className="text-sm">{message}</span>
      </div>
    </TableCell>
  </TableRow>
)

// ============================================================================
// Main Table Component
// ============================================================================

function Table<TData>({
  data,
  columns,
  sorting: externalSorting,
  onSortingChange,
  pagination: externalPagination,
  onPaginationChange,
  rowCount,
  enablePagination = true,
  enableRowSelection = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange,
  globalFilter: externalGlobalFilter,
  onGlobalFilterChange,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange,
  isLoading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
  pageSizeOptions = [10, 20, 30, 50],
  caption,
  className,
  size,
  variant,
  ...props
}: ITableProps<TData>) {
  // Internal states (used when not controlled)
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] || 10,
  })
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([])

  // Determine controlled vs uncontrolled
  const sorting = externalSorting ?? internalSorting
  const pagination = externalPagination ?? internalPagination
  const rowSelection = externalRowSelection ?? internalRowSelection
  const globalFilter = externalGlobalFilter ?? internalGlobalFilter
  const columnFilters = externalColumnFilters ?? internalColumnFilters

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: enablePagination ? pagination : undefined,
      rowSelection,
      globalFilter,
      columnFilters,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onPaginationChange: enablePagination
      ? (onPaginationChange ?? setInternalPagination)
      : undefined,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination && rowCount === undefined ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: rowCount !== undefined,
    rowCount,
    enableRowSelection,
  })

  return (
    <div
      className={cn(tableContainerVariants({ size, className }))}
      {...props}
    >
      <div className="overflow-x-auto">
        <TableRoot className={cn(tableVariants({ variant }))}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <SortHeader
                        title={
                          typeof header.column.columnDef.header === "string"
                            ? header.column.columnDef.header
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )?.toString() ?? ""
                        }
                        isSorted={header.column.getIsSorted()}
                        canSort={header.column.getCanSort()}
                        onSort={() => header.column.toggleSorting()}
                      />
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton columnCount={columns.length} />
            ) : table.getRowModel().rows.length === 0 ? (
              <EmptyState columnCount={columns.length} message={emptyMessage} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </div>

      {enablePagination && !isLoading && data.length > 0 && (
        <Pagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}

// ============================================================================
// Utility: Create Selection Column
// ============================================================================

export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#3B82F6]"
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#3B82F6]"
        aria-label="행 선택"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  Table,
  TableRoot,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableContainerVariants,
  tableVariants,
}

export type { ColumnDef, SortingState, PaginationState, RowSelectionState, Row }

