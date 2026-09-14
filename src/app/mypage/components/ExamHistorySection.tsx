"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  Pagination,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  DEV_MOCK_EXAM_HISTORY_CARDS,
  type IMockExamHistoryCard,
} from "@/lib/dev-mock-data";

import { MyPageCard } from "./MyPageCard";
import { useExamHistoryQuery } from "../hooks/service";
import { EXAM_TYPE_LABEL } from "../interface";

const IS_DEV = process.env.NODE_ENV === "development";
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

  if (!data) {
    if (IS_DEV) {
      return <MockExamHistoryList />;
    }
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-[#6B7280]">아직 제출한 시험이 없어요.</p>
        <Button onClick={() => router.push("/")}>과목 목록 보러가기</Button>
      </div>
    );
  }

  const { exam, totalQuestions, correctCount, wrongCount, submittedAt, answers } =
    data;
  const correctRate =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const examTypeLabel = EXAM_TYPE_LABEL[exam.examType] ?? "";

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MyPageCard onClick={() => router.push(`/exam/_/${exam.id}/test-mode`)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="shrink-0 truncate text-sm font-semibold text-[#101828]">
                {exam.subject}
              </p>
              <p className="truncate text-xs text-[#9CA3AF]">
                {exam.year}년 · {examTypeLabel}
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
            제출일 {formatDate(submittedAt)} · {correctCount}/{totalQuestions}문항 정답
          </p>
        </MyPageCard>
      </div>

      {/* 정오표 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#101828]">
          정오표 (정답 {correctCount} · 오답 {wrongCount})
        </h3>
        <TableRoot className="w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14">번호</TableHead>
              <TableHead>지문</TableHead>
              <TableHead className="w-20">내 답</TableHead>
              <TableHead className="w-20">정답</TableHead>
              <TableHead className="w-16 text-center">정오</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answers.map((answer) => (
              <TableRow key={answer.questionId}>
                <TableCell className="text-[#6B7280]">
                  {answer.questionNumber}
                </TableCell>
                <TableCell className="max-w-0 truncate">
                  {answer.questionText}
                </TableCell>
                <TableCell>
                  {answer.userAnswer === null ? (
                    <span className="text-[#9CA3AF]">미선택</span>
                  ) : (
                    answer.userAnswer
                  )}
                </TableCell>
                <TableCell>{answer.correctAnswers.join(", ")}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      answer.isCorrect
                        ? "bg-[#DCFCE7] text-[#22C55E]"
                        : "bg-[#FEE2E2] text-[#EF4444]"
                    )}
                  >
                    {answer.isCorrect ? "O" : "X"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
    </div>
  );
};

/** 개발 전용: 실 API가 단건만 반환해 볼 수 없는 "목록형" 풀이내역을 미리보기 위한 목업 뷰 */
function MockExamHistoryList() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const pageCount = Math.max(
    Math.ceil(DEV_MOCK_EXAM_HISTORY_CARDS.length / pageSize),
    1
  );
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1);
  const pageItems = DEV_MOCK_EXAM_HISTORY_CARDS.slice(
    clampedPageIndex * pageSize,
    clampedPageIndex * pageSize + pageSize
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pageItems.map((card) => (
          <MockExamHistoryCard key={card.id} card={card} router={router} />
        ))}
      </div>

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
    </div>
  );
}

function MockExamHistoryCard({
  card,
  router,
}: {
  card: IMockExamHistoryCard;
  router: ReturnType<typeof useRouter>;
}) {
  const correctRate = Math.round(
    (card.correctCount / card.totalQuestions) * 100
  );

  return (
    <MyPageCard onClick={() => router.push(`/exam/_/${card.id}/test-mode`)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="shrink-0 truncate text-sm font-semibold text-[#101828]">
            {card.subjectName}
          </p>
          <p className="truncate text-xs text-[#9CA3AF]">
            {card.year}년 · {card.examType}
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
        {formatDate(card.submittedAt)} · {card.correctCount}/{card.totalQuestions}문항
      </p>
    </MyPageCard>
  );
}
