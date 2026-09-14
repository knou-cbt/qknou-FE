"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface IMyPageCardProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * 마이페이지 북마크/풀이내역 카드 공통 셸.
 * 모바일(<sm)에서는 아이콘형 리스트 행(우측 쉐브론) 스타일, sm 이상에서는 카드 그리드 스타일.
 */
export function MyPageCard({ onClick, className, children }: IMyPageCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className={cn(
        "flex cursor-pointer flex-row items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-all",
        "sm:flex-col sm:items-stretch sm:gap-3 sm:rounded-xl sm:border sm:border-[#E5E7EB] sm:p-4 sm:shadow-none sm:hover:border-[#155DFC] sm:hover:shadow-md sm:hover:-translate-y-0.5",
        className
      )}
    >
      <div className="min-w-0 flex-1 sm:contents">{children}</div>
      <ChevronRight className="size-4 shrink-0 text-[#D1D5DC] sm:hidden" />
    </div>
  );
}
