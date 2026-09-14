import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================================================
// Pagination (Table을 포함해 페이지네이션이 필요한 모든 화면에서 공용으로 사용)
// ============================================================================

export interface IPaginationProps {
  pageIndex: number;
  pageCount: number;
  onPageIndexChange: (pageIndex: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  /** true면 배경/테두리 없이 페이지 이동 컨트롤만 가운데 정렬로 렌더 (테이블/카드 밖에서 단독으로 쓸 때) */
  bare?: boolean;
}

export function Pagination({
  pageIndex,
  pageCount,
  onPageIndexChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  className,
  bare = false,
}: IPaginationProps) {
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const showPageSizeSelector = Boolean(
    pageSize !== undefined && onPageSizeChange && pageSizeOptions?.length
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3",
        showPageSizeSelector ? "justify-between" : "justify-center",
        bare ? "py-1" : "border-t border-[#E5E7EB] bg-white px-3 sm:px-4 py-3",
        className
      )}
    >
      {showPageSizeSelector && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7280]">
          <span className="whitespace-nowrap">페이지당</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="h-7 sm:h-8 px-2 rounded border border-[#D1D5DB] bg-white text-[#374151] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          >
            {pageSizeOptions!.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="whitespace-nowrap">행</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-6">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => onPageIndexChange(0)}
            disabled={!canPreviousPage}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="첫 페이지"
          >
            <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
          <button
            type="button"
            onClick={() => onPageIndexChange(pageIndex - 1)}
            disabled={!canPreviousPage}
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
            onClick={() => onPageIndexChange(pageIndex + 1)}
            disabled={!canNextPage}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
          <button
            type="button"
            onClick={() => onPageIndexChange(pageCount - 1)}
            disabled={!canNextPage}
            className="p-1 sm:p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="마지막 페이지"
          >
            <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>
    </div>
  );
}
