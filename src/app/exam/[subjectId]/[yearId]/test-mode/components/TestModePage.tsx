"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  QuestionCard,
  QuestionNavigator,
  ExamNavButtons,
  type TQuestionState,
  Button,
} from "@/components/ui";
import { API_URL } from "@/constants";
import { useExamContext } from "@/contexts";
import { useIsMobile } from "@/lib/useIsMobile";
import { useCopyProtection } from "@/lib/useCopyProtection";
import { useExamQuestionsQuery, useExamSubmitMutation } from "../hooks/service";
import type { IQuestion, IQuestionResult } from "../interface";

type Props = {
  subjectId?: string;
  yearId?: string;
};

type TutorQuestionExplanation = {
  success: boolean;
  explanation: string;
  conceptTags?: string[] | null;
  generated: boolean;
};

const POST_LOGIN_REDIRECT_KEY = "qknou_post_login_redirect";
type QuestionMetaFields = {
  questionText?: string | null;
  question?: string | null;
  explanation?: string | null;
  commonText?: string | null;
  commonExample?: string | null;
  sharedExample?: string | null;
  commonView?: string | null;
  commonImageUrls?: string[] | null;
  commonImageUrl?: string | null;
  images?: string[] | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const pickFirstText = (...values: unknown[]): string | undefined =>
  values.find(isNonEmptyString)?.trim();

const collectImageUrls = (...values: unknown[]): string[] => {
  const urls = values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    return [value];
  });

  const seen = new Set<string>();
  return urls
    .filter(isNonEmptyString)
    .map((url) => url.trim())
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
};

export const TestModePage = ({ subjectId, yearId }: Props) => {
  const router = useRouter();

  const examId = yearId;

  const isMobile = useIsMobile();
  const {
    setOnExamEnd,
    setUnansweredCount,
    setTotalQuestions,
    setIsSubmitted: setContextIsSubmitted,
  } = useExamContext();
  useCopyProtection();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, string | number | null>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<IQuestionResult[]>([]);
  const [visibleExplanationByQuestion, setVisibleExplanationByQuestion] =
    useState<Record<number, boolean>>({});
  const [resultExplanationsByQuestion, setResultExplanationsByQuestion] =
    useState<Record<number, TutorQuestionExplanation>>({});
  const [explanationErrorByQuestion, setExplanationErrorByQuestion] = useState<
    Record<number, string | null>
  >({});
  const [explanationLoadingQuestionId, setExplanationLoadingQuestionId] =
    useState<number | null>(null);

  // 시험 시작 시간 추적
  const [startTime] = useState<number>(() => Date.now());

  // API 호출
  const { data, isLoading, isError } = useExamQuestionsQuery(
    examId ?? ""
  );
  const submitMutation = useExamSubmitMutation(examId ?? "");

  const exam = data?.exam;
  const questions = useMemo(() => data?.questions ?? [], [data?.questions]);

  // 풀지 않은 문제 개수 계산 및 Context 업데이트
  const unansweredCount = useMemo(() => {
    const answeredCount = Object.keys(answers).filter(
      (key) =>
        answers[Number(key)] !== null && answers[Number(key)] !== undefined
    ).length;
    return questions.length - answeredCount;
  }, [questions.length, answers]);

  // Context에 상태 동기화
  useEffect(() => {
    setTotalQuestions(questions.length);
  }, [questions.length, setTotalQuestions]);

  useEffect(() => {
    setUnansweredCount(unansweredCount);
  }, [unansweredCount, setUnansweredCount]);

  // 소요 시간 계산
  const [elapsedTime, setElapsedTime] = useState(0);

  // 시험 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (questions.length === 0 || isSubmitted) return;

    const submitData = {
      answers: questions.map((q, index) => ({
        questionId: q.id,
        selectedAnswer:
          answers[index] !== undefined ? Number(answers[index]) : null,
      })),
    };

    try {
      const response = await submitMutation.mutateAsync(submitData);
      setResults(response.results);
      setIsSubmitted(true);
      setContextIsSubmitted(true); // Context 상태도 업데이트
      // 소요 시간 계산
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      // 결과 화면에서 첫 번째 문제로 포커스
      setCurrentIndex(0);
    } catch (error) {
      console.error("시험 제출 실패:", error);
    }
  }, [
    questions,
    answers,
    isSubmitted,
    submitMutation,
    startTime,
    setContextIsSubmitted,
  ]);

  // handleSubmit을 ref로 관리하여 의존성 문제 해결
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // 시험 종료 핸들러 등록 (한 번만 실행)
  useEffect(() => {
    const handleExamEnd = () => {
      handleSubmitRef.current();
    };

    setOnExamEnd(handleExamEnd);

    return () => {
      setOnExamEnd(null);
    };
  }, [setOnExamEnd]);

  // 페이지 떠날 때 Context 상태 초기화
  useEffect(() => {
    return () => {
      setContextIsSubmitted(false);
    };
  }, [setContextIsSubmitted]);

  const currentQuestion = questions[currentIndex];
  const currentQuestionMeta = currentQuestion as
    | (IQuestion & QuestionMetaFields)
    | undefined;
  const selectedAnswer = answers[currentIndex] ?? null;

  // choices를 QuestionCard에 맞는 형식으로 변환
  const formattedAnswers = useMemo(() => {
    if (!currentQuestion?.choices) return [];
    return currentQuestion.choices.map((choice) => ({
      value: choice.number,
      label: choice.text,
    }));
  }, [currentQuestion]);

  const normalizedQuestionText = pickFirstText(
    currentQuestion?.text,
    currentQuestionMeta?.questionText,
    currentQuestionMeta?.question
  );
  const normalizedExample = pickFirstText(
    currentQuestion?.example,
    currentQuestionMeta?.commonText,
    currentQuestionMeta?.commonExample,
    currentQuestionMeta?.sharedExample,
    currentQuestionMeta?.commonView
  );
  const questionTitle = normalizedQuestionText
    ? `${currentIndex + 1}. ${normalizedQuestionText}`
    : undefined;
  const normalizedImageUrls = useMemo(() => {
    if (!currentQuestion) return undefined;

    const urls = collectImageUrls(
      currentQuestion.imageUrls,
      currentQuestion.imageUrl,
      currentQuestionMeta?.commonImageUrls,
      currentQuestionMeta?.commonImageUrl,
      currentQuestionMeta?.images
    );
    return urls.length > 0 ? urls : undefined;
  }, [currentQuestion, currentQuestionMeta]);

  // 문제 상태 계산
  const questionStates = useMemo(() => {
    const states: Record<number, TQuestionState> = {};

    questions.forEach((q, index) => {
      if (isSubmitted && results.length > 0) {
        const result = results.find((r) => r.questionId === q.id);
        if (result) {
          if (result.isCorrect) {
            states[index + 1] = "correct";
          } else if (result.selectedAnswer !== null) {
            states[index + 1] = "incorrect";
          } else {
            states[index + 1] = "skipped";
          }
        }
      } else if (answers[index] !== null && answers[index] !== undefined) {
        states[index + 1] = "answered";
      }
    });

    return states;
  }, [questions, answers, isSubmitted, results]);

  const handleAnswerSelect = useCallback(
    (value: string | number) => {
      if (!isSubmitted) {
        setAnswers((prev) => ({
          ...prev,
          [currentIndex]: value,
        }));
      }
    },
    [currentIndex, isSubmitted]
  );

  const handleQuestionSelect = useCallback((questionNumber: number) => {
    setCurrentIndex(questionNumber - 1);
  }, []);

  // 이전/다음 버튼 핸들러
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  // 시간 포맷팅 (분:초)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  // 통계 계산 (제출 후에만 계산)
  const correctCount = useMemo(
    () => results.filter((r) => r.isCorrect).length,
    [results]
  );
  const wrongCount = useMemo(
    () => results.length - correctCount,
    [results.length, correctCount]
  );
  const correctRate = useMemo(
    () =>
      results.length > 0
        ? Math.round((correctCount / results.length) * 100)
        : 0,
    [results.length, correctCount]
  );

  // 제출 후 정답 정보 (결과에서 가져옴)
  const currentResult = results.find(
    (r) => r.questionId === currentQuestion?.id
  );
  const currentQuestionId = currentQuestion?.id;
  const isExplanationVisible = currentQuestionId
    ? Boolean(visibleExplanationByQuestion[currentQuestionId])
    : false;
  const explanationData = currentQuestionId
    ? resultExplanationsByQuestion[currentQuestionId]
    : undefined;
  const explanationText = explanationData?.explanation ?? currentQuestionMeta?.explanation;
  const conceptTags = explanationData?.conceptTags ?? [];
  const explanationError = currentQuestionId
    ? explanationErrorByQuestion[currentQuestionId]
    : null;
  const isExplanationLoading =
    currentQuestionId !== undefined &&
    explanationLoadingQuestionId === currentQuestionId;

  const handleToggleExplanation = useCallback(async () => {
    const questionId = currentQuestion?.id;
    if (!questionId) return;

    const nextVisible = !visibleExplanationByQuestion[questionId];
    setVisibleExplanationByQuestion((prev) => ({
      ...prev,
      [questionId]: nextVisible,
    }));

    if (!nextVisible || resultExplanationsByQuestion[questionId]) return;

    setExplanationErrorByQuestion((prev) => ({ ...prev, [questionId]: null }));
    setExplanationLoadingQuestionId(questionId);

    try {
      const response = await fetch(
        `${API_URL}/api/tutor/questions/${questionId}/explanation`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error("해설 조회 실패");

      const data = (await response.json()) as TutorQuestionExplanation;
      if (!data.success) throw new Error("해설 생성 실패");

      setResultExplanationsByQuestion((prev) => ({
        ...prev,
        [questionId]: data,
      }));
    } catch {
      setExplanationErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: "해설을 불러오지 못했습니다. 다시 시도해 주세요.",
      }));
    } finally {
      setExplanationLoadingQuestionId((prev) =>
        prev === questionId ? null : prev
      );
    }
  }, [currentQuestion?.id, visibleExplanationByQuestion, resultExplanationsByQuestion]);

  useEffect(() => {
    if (!subjectId || !yearId || typeof window === "undefined") return;
    sessionStorage.setItem(
      POST_LOGIN_REDIRECT_KEY,
      `/exam/${subjectId}/${yearId}/test-mode`
    );
  }, [subjectId, yearId]);

  if (!examId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">시험 정보가 올바르지 않습니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#6B7280]">문제를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">문제를 불러오는데 실패했습니다.</p>
      </div>
    );
  }
  // 시험 결과 화면
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        <main className="flex-1 flex flex-col items-center px-4 py-4 sm:py-8">
          {/* 페이지 제목 */}
          <div className="w-full max-w-[1104px] mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828] mb-2">
              시험 결과
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#6B7280]">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{exam?.subject ?? "-"}</span>
              </div>
            </div>
          </div>

          {/* 점수 카드 */}
          <div className="w-full max-w-[1104px] bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* 왼쪽: 획득 점수 */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-full shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#155DFC]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#6B7280]">획득 점수</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#101828]">
                    {correctCount}
                    <span className="text-base sm:text-lg font-normal text-[#9CA3AF]">
                      /{questions.length}
                    </span>
                  </p>
                </div>
              </div>

              {/* 오른쪽: 정답률 */}
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-[#6B7280]">정답률</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#155DFC]">
                  {correctRate}%
                </p>
              </div>
            </div>

            {/* 프로그레스 바 */}
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
          <div className="w-full max-w-[1104px] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* 총 소요 시간 */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#F3F4F6] rounded-full shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">총 소요 시간</p>
                <p className="text-base sm:text-lg font-semibold text-[#101828] truncate">
                  {formatTime(elapsedTime)}
                </p>
              </div>
            </div>

            {/* 정답 */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#DCFCE7] rounded-full shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">정답</p>
                <p className="text-base sm:text-lg font-semibold text-[#101828]">
                  {correctCount}개
                </p>
              </div>
            </div>

            {/* 오답 */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#FEE2E2] rounded-full shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF4444]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">오답</p>
                <p className="text-base sm:text-lg font-semibold text-[#101828]">
                  {wrongCount}개
                </p>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="w-full max-w-[1104px] mb-4 sm:mb-6">
            <QuestionNavigator
              size="full"
              totalQuestions={questions.length}
              currentQuestion={currentIndex + 1}
              questionStates={questionStates}
              showCheckmarks={true}
              showLegend={true}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>

          {/* 문제 카드 */}
          <div className="w-full max-w-[1104px] bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            {currentQuestion && (
              <>
                <QuestionCard
                  size="full"
                  question={questionTitle}
                  example={normalizedExample}
                  imageUrls={normalizedImageUrls}
                  answers={formattedAnswers}
                  selectedAnswer={
                    answers[currentIndex] !== undefined
                      ? answers[currentIndex]
                      : null
                  }
                  correctAnswer={currentResult?.correctAnswers ?? []}
                  showResult={true}
                  actionButtonText=""
                />
                {isExplanationVisible && (
                  <div className="mt-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-5">
                    {isExplanationLoading && (
                      <p className="text-sm text-[#6B7280]">해설을 생성하는 중...</p>
                    )}
                    {explanationError && (
                      <p className="text-sm text-red-500">{explanationError}</p>
                    )}
                    {!isExplanationLoading && !explanationError && explanationText && (
                      <div className="text-[#364153] leading-7 [&_a]:text-[#155DFC] [&_a]:underline [&_code]:rounded [&_code]:bg-[#F3F4F6] [&_code]:px-1 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc">
                        <ReactMarkdown>{explanationText}</ReactMarkdown>
                        {conceptTags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {conceptTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#EEF2FF] text-[#3730A3] px-3 py-1 text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="w-full max-w-[896px]">
            <ExamNavButtons
              onPrevClick={handlePrev}
              onAnswerClick={() => void handleToggleExplanation()}
              onNextClick={handleNext}
              prevDisabled={currentIndex === 0}
              nextDisabled={currentIndex === questions.length - 1}
              answerLabel={isExplanationVisible ? "해설 숨기기" : "해설 보기"}
            />
          </div>

          {/* 홈으로 돌아가기 버튼 */}
          <div className="w-full max-w-[896px] mt-3 sm:mt-4">
            <Button
              onClick={() => router.push("/")}
              className="w-full cursor-pointer text-sm sm:text-base h-12"
              variant="black"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // 시험 진행 화면
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        {/* Question Info */}
        <div className="w-full max-w-[1100px]">
          <p className="text-sm text-[#6B7280]">
            {exam?.title ?? "-"} | 시험모드 | {currentIndex + 1} /{" "}
            {questions.length}
          </p>
        </div>

        {/* Question Navigator - 모바일에서는 숨김 */}
        {!isMobile && (
          <div className="w-full max-w-[1104px] mb-6">
            <QuestionNavigator
              size="full"
              totalQuestions={questions.length}
              currentQuestion={currentIndex + 1}
              questionStates={questionStates}
              showCheckmarks={true}
              showLegend={true}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <div className="w-full max-w-[1100px]">
            <QuestionCard
              size="full"
              question={questionTitle}
              example={normalizedExample}
              imageUrls={normalizedImageUrls}
              answers={formattedAnswers}
              selectedAnswer={selectedAnswer}
              correctAnswer={[]}
              showResult={false}
              onAnswerSelect={handleAnswerSelect}
              actionButtonText=""
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="w-full max-w-[896px] mt-6">
          <ExamNavButtons
            onPrevClick={handlePrev}
            onNextClick={handleNext}
            prevDisabled={currentIndex === 0}
            nextDisabled={currentIndex === questions.length - 1}
            showAnswer={false}
          />
        </div>
      </main>
    </div>
  );
};
