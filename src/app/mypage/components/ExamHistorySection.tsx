"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Pagination } from "@/components/ui";
import { cn } from "@/lib/utils";

import { MyPageCard } from "./MyPageCard";
import { useExamHistoryQuery } from "../hooks/service";
import { EXAM_TYPE_LABEL } from "../interface";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function rateBadgeClass(rate: number) {
  if (rate >= 80) return "bg-[#EFF6FF] text-[#155DFC]";
  if (rate >= 50) return "bg-[#FEFCE8] text-[#CA8A04]";
  return "bg-[#FEF2F2] text-[#DC2626]";
}

function rateBarClass(rate: number) {
  if (rate >= 80) return "bg-[#155DFC]";
  if (rate >= 50) return "bg-[#FACC15]";
  return "bg-[#EF4444]";
}

export const ExamHistorySection = () => {
  const router = useRouter();
  const { data, isLoading } = useExamHistoryQuery();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const history = data?.items ?? [];

  const pageCount = Math.max(Math.ceil(history.length / pageSize), 1);
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1);
  const pageItems = history.slice(
    clampedPageIndex * pageSize,
    clampedPageIndex * pageSize + pageSize
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex animate-pulse flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-[#E5E7EB]" />
                <div className="h-3 w-1/3 rounded bg-[#F3F4F6]" />
              </div>
              <div className="h-5 w-10 shrink-0 rounded-full bg-[#F3F4F6]" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#F3F4F6]" />
            <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-[#6B7280]">아직 제출한 시험이 없어요.</p>
        <Button onClick={() => router.push("/")}>과목 목록 보러가기</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pageItems.map((item) => {
          const correctRate =
            item.totalQuestions > 0
              ? Math.round((item.correctCount / item.totalQuestions) * 100)
              : 0;
          const examTypeLabel = EXAM_TYPE_LABEL[item.examType] ?? "";

          return (
            <MyPageCard
              key={item.id}
              onClick={() => router.push(`/exam/_/${item.examId}/test-mode`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <p className="shrink-0 truncate text-sm font-semibold text-[#101828]">
                    {item.subjectName}
                  </p>
                  <p className="truncate text-xs text-[#9CA3AF]">
                    {item.year}년 · {examTypeLabel}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    rateBadgeClass(correctRate)
                  )}
                >
                  {correctRate}%
                </span>
              </div>

              <p className="truncate text-xs text-[#9CA3AF]">{item.examTitle}</p>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className={cn("h-full rounded-full", rateBarClass(correctRate))}
                  style={{ width: `${correctRate}%` }}
                />
              </div>

              <p className="text-xs text-[#9CA3AF]">
                제출일 {formatDate(item.submittedAt)} · {item.correctCount}/
                {item.totalQuestions}문항 정답
              </p>
            </MyPageCard>
          );
        })}
      </div>

      {history.length > 0 && (
        <Pagination
          pageIndex={clampedPageIndex}
          pageCount={pageCount}
          onPageIndexChange={setPageIndex}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          bare
        />
      )}
    </div>
  );
};
