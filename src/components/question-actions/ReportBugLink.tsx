"use client";

import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";

interface IReportBugLinkProps {
  onClick: () => void;
  className?: string;
}

/** 문제/해설 오류 제보 진입점. 공유·북마크와 혼동되지 않도록 답안 영역 하단에 텍스트 링크로 배치 */
export const ReportBugLink = ({ onClick, className }: IReportBugLinkProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors cursor-pointer hover:text-[#374153]",
        className
      )}
    >
      <Flag className="size-3.5" />
      이 문제에 오류가 있나요? 제보하기
    </button>
  );
};
