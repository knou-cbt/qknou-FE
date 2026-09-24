"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { Button, Pagination, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

import { MyPageCard } from "./MyPageCard";
import { useAllExamHistoryQuery } from "../hooks/service";
import { EXAM_TYPE_LABEL } from "../interface";

const ALL_SUBJECTS = "all";

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [subjectFilter, setSubjectFilter] = useState(ALL_SUBJECTS);
  const { data: allHistory, isLoading } = useAllExamHistoryQuery();

  const subjectOptions = useMemo(() => {
    const names = Array.from(
      new Set((allHistory ?? []).map((item) => item.subjectName))
    );
    return [
      { value: ALL_SUBJECTS, label: "전체 과목" },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [allHistory]);

  const filteredHistory = useMemo(() => {
    if (subjectFilter === ALL_SUBJECTS) return allHistory ?? [];
    return (allHistory ?? []).filter(
      (item) => item.subjectName === subjectFilter
    );
  }, [allHistory, subjectFilter]);

  const pageCount = Math.max(Math.ceil(filteredHistory.length / pageSize), 1);
  const history = filteredHistory.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  const handleSubjectFilterChange = (value: string) => {
    setSubjectFilter(value);
    setPageIndex(0);
  };

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

  if ((allHistory ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-[#6B7280]">아직 제출한 시험이 없어요.</p>
        <Button onClick={() => router.push("/")}>시험 대비하러 가기</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-xs text-[#1E3A8A] sm:text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-[#3B82F6]" />
        <p>
          같은 과목·연도 시험을 다시 풀면 이전 기록은 이번 결과로
          대체돼요. 과목·연도 조합당 최근 풀이 1건만 보관돼요.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select
          options={subjectOptions}
          value={subjectFilter}
          onChange={handleSubjectFilterChange}
          aria-label="과목별 필터"
          className="w-40"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-10 text-center">
          <p className="text-[#6B7280]">해당 과목의 풀이 기록이 없어요.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {history.map((item) => {
          const correctRate =
            item.totalQuestions > 0
              ? Math.round((item.correctCount / item.totalQuestions) * 100)
              : 0;
          const examTypeLabel = EXAM_TYPE_LABEL[item.examType] ?? "";

          return (
            <MyPageCard key={item.id}>
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

              <div className="mt-1 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:border-[#155DFC] hover:bg-[#EFF6FF] hover:text-[#155DFC]"
                  onClick={() => router.push(`/mypage/history/${item.id}`)}
                >
                  결과 보기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:border-[#155DFC] hover:bg-[#EFF6FF] hover:text-[#155DFC]"
                  onClick={() =>
                    router.push(`/exam/_/${item.examId}/test-mode`)
                  }
                >
                  다시 풀기
                </Button>
              </div>
            </MyPageCard>
          );
        })}
      </div>
      )}

      {filteredHistory.length > 0 && (
        <Pagination
          pageIndex={pageIndex}
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
