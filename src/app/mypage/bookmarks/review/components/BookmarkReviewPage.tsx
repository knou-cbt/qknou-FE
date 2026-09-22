"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { Button, ExamNavButtons, QuestionCard } from "@/components/ui";
import { ExplanationGate } from "@/components/ads/ExplanationGate";
import { useAuth } from "@/contexts";
import { cn } from "@/lib/utils";
import { POST_LOGIN_REDIRECT_KEY } from "@/lib/auth-token";
import {
  examDetailContentAreaClassName,
  examDetailMaxW,
  examDetailStyle,
} from "@/lib/exam-side-ad-layout";
import { useCopyProtection } from "@/lib/useCopyProtection";
import { useBookmarkListQuery } from "@/components/bookmark/hooks/service";
import { useQuestionQuery } from "@/app/memorize/[questionId]/hooks/service";

/** 북마크한 문항을 암기모드처럼 1/N -> 2/N 순서로 이어보는 복습 화면 */
export const BookmarkReviewPage = () => {
  useCopyProtection();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          POST_LOGIN_REDIRECT_KEY,
          window.location.pathname + window.location.search
        );
      }
      router.replace("/auth/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data: bookmarks, isLoading: isBookmarksLoading } =
    useBookmarkListQuery();

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCount = bookmarks?.length ?? 0;
  const currentBookmark = bookmarks?.[currentIndex];

  const { data: question, isLoading: isQuestionLoading } = useQuestionQuery(
    currentBookmark ? String(currentBookmark.questionId) : ""
  );

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 문항이 바뀌면(이전/다음 이동) 선택/결과 상태를 초기화한다. effect 대신 렌더 중
  // 비교해 리셋하는 방식으로 setState-in-effect 경고를 피한다.
  const [renderedQuestionId, setRenderedQuestionId] = useState(
    currentBookmark?.questionId
  );
  if (currentBookmark?.questionId !== renderedQuestionId) {
    setRenderedQuestionId(currentBookmark?.questionId);
    setSelectedAnswer(null);
    setShowResult(false);
  }

  const handleAnswerSelect = useCallback(
    (value: string | number) => {
      if (showResult) return;
      setSelectedAnswer(Number(value));
    },
    [showResult]
  );

  const formattedAnswers = useMemo(() => {
    if (!question?.choices) return [];
    return question.choices.map((choice) => ({
      value: choice.number,
      label: choice.text,
      imageUrls: choice.imageUrls,
    }));
  }, [question]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF]">
        <p className="text-[#6B7280]">불러오는 중...</p>
      </div>
    );
  }

  if (isBookmarksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF]">
        <p className="text-[#6B7280]">불러오는 중...</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F4FF] px-4 text-center">
        <p className="text-[#6B7280]">북마크한 문항이 없어요.</p>
        <Button onClick={() => router.push("/mypage?tab=bookmarks")}>
          북마크 목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4FF]">
      <div
        style={examDetailStyle}
        className={cn("flex flex-1 flex-col", examDetailContentAreaClassName)}
      >
        <main className="flex flex-1 flex-col items-center px-4 py-6">
          <div className={cn(examDetailMaxW[896], "mb-4")}>
            <button
              type="button"
              onClick={() => router.push("/mypage?tab=bookmarks")}
              className="text-sm text-[#6B7280] hover:text-[#374151]"
            >
              ← 북마크 목록으로
            </button>
          </div>

          <div
            className={cn(
              examDetailMaxW[896],
              "mb-2 flex items-center justify-between"
            )}
          >
            <p className="text-sm text-[#6B7280]">
              {currentBookmark?.subjectName}
              {question ? ` | 문항 ${question.questionNumber}번` : ""}
            </p>
            <p className="text-sm font-medium text-[#374151]">
              {currentIndex + 1} / {totalCount}
            </p>
          </div>

          {isQuestionLoading || !question ? (
            <div className={cn(examDetailMaxW[896], "py-16 text-center")}>
              <p className="text-[#6B7280]">문제를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className={examDetailMaxW[896]}>
                <QuestionCard
                  size="full"
                  question={`${question.questionNumber}. ${question.text}`}
                  sharedExample={question.sharedExample}
                  example={question.example}
                  imageUrls={question.imageUrls}
                  answers={formattedAnswers}
                  selectedAnswer={selectedAnswer}
                  correctAnswer={question.correctAnswers}
                  showResult={showResult}
                  onAnswerSelect={handleAnswerSelect}
                  actionButtonText=""
                />
              </div>

              {showResult && (
                <div className={cn(examDetailMaxW[896], "mt-6")}>
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-6">
                    <h3 className="font-semibold text-[#101828] mb-3">해설</h3>
                    {question.explanation ? (
                      <ExplanationGate>
                        <div className="text-[#364153] leading-7 [&_a]:text-[#155DFC] [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc">
                          <ReactMarkdown>{question.explanation}</ReactMarkdown>
                        </div>
                      </ExplanationGate>
                    ) : (
                      <p className="text-[#6B7280]">등록된 해설이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}

              <div className={cn(examDetailMaxW[896], "mt-6")}>
                <ExamNavButtons
                  onPrevClick={() =>
                    setCurrentIndex((prev) => Math.max(prev - 1, 0))
                  }
                  onAnswerClick={() => setShowResult(true)}
                  onNextClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(prev + 1, totalCount - 1)
                    )
                  }
                  prevDisabled={currentIndex === 0}
                  nextDisabled={currentIndex === totalCount - 1}
                  answerLabel="정답 확인"
                  answerDisabled={showResult || selectedAnswer === null}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
