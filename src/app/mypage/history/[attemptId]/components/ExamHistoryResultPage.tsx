"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";

import {
  ExamNavButtons,
  QuestionCard,
  QuestionNavigator,
  type TQuestionState,
} from "@/components/ui";
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
import { useQuestionQuery } from "@/app/memorize/[questionId]/hooks/service";

import { useExamHistoryDetailQuery } from "../../../hooks/service";
import { EXAM_TYPE_LABEL } from "../../../interface";

type Props = {
  attemptId: string;
};

/** 마이페이지 "결과 보기" — 시험모드 제출 직후 결과 화면과 동일한 레이아웃으로 과거 풀이를 다시 본다 */
export const ExamHistoryResultPage = ({ attemptId }: Props) => {
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

  const parsedAttemptId = Number(attemptId);
  const { data, isLoading: isDetailLoading } = useExamHistoryDetailQuery(
    Number.isFinite(parsedAttemptId) ? parsedAttemptId : null
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const answers = useMemo(() => data?.answers ?? [], [data]);
  const totalCount = answers.length;
  const currentAnswer = answers[currentIndex];

  const { data: question, isLoading: isQuestionLoading } = useQuestionQuery(
    currentAnswer ? String(currentAnswer.questionId) : ""
  );

  const [showExplanation, setShowExplanation] = useState(false);
  // 문항이 바뀌면 해설 노출 상태를 초기화한다. effect 대신 렌더 중 비교해 리셋하는
  // 방식으로 setState-in-effect 경고를 피한다.
  const [renderedQuestionId, setRenderedQuestionId] = useState(
    currentAnswer?.questionId
  );
  if (currentAnswer?.questionId !== renderedQuestionId) {
    setRenderedQuestionId(currentAnswer?.questionId);
    setShowExplanation(false);
  }

  const formattedAnswers = useMemo(() => {
    if (!question?.choices) return [];
    return question.choices.map((choice) => ({
      value: choice.number,
      label: choice.text,
      imageUrls: choice.imageUrls,
    }));
  }, [question]);

  const questionStates = useMemo(() => {
    const states: Record<number, TQuestionState> = {};
    answers.forEach((answer, index) => {
      states[index + 1] = answer.isCorrect
        ? "correct"
        : answer.userAnswer !== null
          ? "incorrect"
          : "skipped";
    });
    return states;
  }, [answers]);

  const correctRate =
    data && data.totalQuestions > 0
      ? Math.round((data.correctCount / data.totalQuestions) * 100)
      : 0;

  if (isAuthLoading || !isAuthenticated || isDetailLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF]">
        <p className="text-[#6B7280]">불러오는 중...</p>
      </div>
    );
  }

  const examTypeLabel = EXAM_TYPE_LABEL[data.exam.examType] ?? "";

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col">
      <div
        style={examDetailStyle}
        className={cn("flex flex-1 flex-col", examDetailContentAreaClassName)}
      >
        <main className="flex-1 flex flex-col items-center px-4 py-4 sm:py-8">
          <div className={cn(examDetailMaxW[896], "mb-4")}>
            <button
              type="button"
              onClick={() => router.push("/mypage")}
              className="text-sm text-[#6B7280] hover:text-[#374151] cursor-pointer"
            >
              ← 마이페이지로
            </button>
          </div>

          {/* 페이지 제목 */}
          <div className={cn(examDetailMaxW[896], "mb-4 sm:mb-6")}>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828] mb-2">
              시험 결과
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#6B7280]">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {data.exam.subject} · {data.exam.year}년 · {examTypeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* 점수 카드 */}
          <div
            className={cn(
              examDetailMaxW[896],
              "bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-4"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-full shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#155DFC]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#6B7280]">획득 점수</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#101828]">
                    {data.correctCount}
                    <span className="text-base sm:text-lg font-normal text-[#9CA3AF]">
                      /{data.totalQuestions}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-[#6B7280]">정답률</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#155DFC]">
                  {correctRate}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 sm:h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${correctRate}%`,
                  background: "linear-gradient(to right, #22C55E, #86EFAC)",
                }}
              />
            </div>
          </div>

          {/* 통계 카드들 */}
          <div
            className={cn(
              examDetailMaxW[896],
              "grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6"
            )}
          >
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#DCFCE7] rounded-full shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">정답</p>
                <p className="text-base sm:text-lg font-semibold text-[#101828]">
                  {data.correctCount}개
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#FEE2E2] rounded-full shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF4444]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">오답</p>
                <p className="text-base sm:text-lg font-semibold text-[#101828]">
                  {data.wrongCount}개
                </p>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className={cn(examDetailMaxW[896], "mb-4 sm:mb-6")}>
            <QuestionNavigator
              size="full"
              totalQuestions={totalCount}
              currentQuestion={currentIndex + 1}
              questionStates={questionStates}
              showCheckmarks
              showLegend
              onQuestionSelect={(n) => setCurrentIndex(n - 1)}
            />
          </div>

          {/* 문제 카드 */}
          <div
            className={cn(
              examDetailMaxW[896],
              "bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
            )}
          >
            {isQuestionLoading || !question ? (
              <p className="py-10 text-center text-sm text-[#6B7280]">
                문제를 불러오는 중...
              </p>
            ) : (
              <>
                <QuestionCard
                  size="full"
                  question={`${question.questionNumber}. ${question.text}`}
                  sharedExample={question.sharedExample}
                  example={question.example}
                  imageUrls={question.imageUrls}
                  answers={formattedAnswers}
                  selectedAnswer={currentAnswer?.userAnswer ?? null}
                  correctAnswer={currentAnswer?.correctAnswers ?? []}
                  showResult
                  actionButtonText=""
                />
                {showExplanation && (
                  <div className="mt-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-5">
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
                )}
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className={examDetailMaxW[896]}>
            <ExamNavButtons
              onPrevClick={() =>
                setCurrentIndex((prev) => Math.max(prev - 1, 0))
              }
              onAnswerClick={() => setShowExplanation((prev) => !prev)}
              onNextClick={() =>
                setCurrentIndex((prev) => Math.min(prev + 1, totalCount - 1))
              }
              prevDisabled={currentIndex === 0}
              nextDisabled={currentIndex === totalCount - 1}
              answerLabel={showExplanation ? "해설 숨기기" : "해설 보기"}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
