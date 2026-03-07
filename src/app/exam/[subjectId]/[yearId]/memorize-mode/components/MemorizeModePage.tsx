"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  ExamNavButtons,
  QuestionCard,
  Breadcrumb,
  Toggle,
} from "@/components/ui";
import { ChatbotPanel } from "@/components/chatbot";
import ReactMarkdown from "react-markdown";
import { useExamQuestionsWithAnswersQuery } from "../hooks/service";
import type { IQuestionWithAnswer } from "../interface";
import { useExamContext } from "@/contexts";
import { useCopyProtection } from "@/lib/useCopyProtection";

type Props = {
  subjectId?: string;
  yearId?: string;
};

const POST_LOGIN_REDIRECT_KEY = "qknou_post_login_redirect";
type QuestionMetaFields = {
  questionText?: string | null;
  question?: string | null;
  commonText?: string | null;
  commonExample?: string | null;
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

export const MemorizeModePage = ({ subjectId, yearId }: Props) => {
  const examId = yearId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  // 정답 기억하기 상태 (questionId -> { showResult, selectedAnswer })
  const [rememberedAnswers, setRememberedAnswers] = useState<
    Record<
      number,
      { showResult: boolean; selectedAnswer: string | number | null }
    >
  >({});

  const { isExplanationVisible, setIsExplanationVisible } = useExamContext();
  useCopyProtection();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // API 호출
  const { data, isLoading, isError } = useExamQuestionsWithAnswersQuery(
    examId ?? ""
  );

  const exam = data?.exam;
  const questions = data?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const currentQuestionMeta = currentQuestion as
    | (IQuestionWithAnswer & QuestionMetaFields)
    | undefined;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasSelectedAnswer = selectedAnswer !== null;

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

  const handleAnswerSelect = useCallback(
    (value: string | number) => {
      if (!showResult) {
        setSelectedAnswer(value);
      }
    },
    [showResult]
  );

  const handleShowAnswer = useCallback(() => {
    setShowResult(true);
  }, []);

  // 문제 이동 시 저장된 정답 상태 복원
  useEffect(() => {
    if (currentQuestion?.id) {
      const remembered = rememberedAnswers[currentQuestion.id];
      if (remembered) {
        setShowResult(remembered.showResult);
        setSelectedAnswer(remembered.selectedAnswer);
      } else {
        setShowResult(false);
        setSelectedAnswer(null);
      }
    }
  }, [currentIndex, currentQuestion?.id, rememberedAnswers]);

  const handlePrev = useCallback(() => {
    if (!isFirstQuestion && currentQuestion?.id) {
      // 현재 문제의 정답 상태와 선택한 답안 저장
      setRememberedAnswers((prev) => {
        const newState: Record<
          number,
          { showResult: boolean; selectedAnswer: string | number | null }
        > = {
          ...prev,
          [currentQuestion.id]: {
            showResult,
            selectedAnswer,
          },
        };
        return newState;
      });

      setCurrentIndex((prev) => prev - 1);
      // showResult와 selectedAnswer는 useEffect에서 복원됨
    }
  }, [isFirstQuestion, currentQuestion?.id, showResult, selectedAnswer]);

  const handleNext = useCallback(() => {
    if (!isLastQuestion && currentQuestion?.id) {
      // 현재 문제의 정답 상태와 선택한 답안 저장
      setRememberedAnswers((prev) => {
        const newState: Record<
          number,
          { showResult: boolean; selectedAnswer: string | number | null }
        > = {
          ...prev,
          [currentQuestion.id]: {
            showResult,
            selectedAnswer,
          },
        };
        return newState;
      });

      setCurrentIndex((prev) => prev + 1);
      // showResult와 selectedAnswer는 useEffect에서 복원됨
    }
  }, [isLastQuestion, currentQuestion?.id, showResult, selectedAnswer]);

  // 문제 다시 풀기 핸들러
  const handleResetQuestion = useCallback(() => {
    if (currentQuestion?.id) {
      setShowResult(false);
      setSelectedAnswer(null);
      // rememberedAnswers에서 해당 문제 제거
      setRememberedAnswers((prev) => {
        const newState = { ...prev };
        delete newState[currentQuestion.id];
        return newState;
      });
    }
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!subjectId || !yearId || typeof window === "undefined") return;
    sessionStorage.setItem(
      POST_LOGIN_REDIRECT_KEY,
      `/exam/${subjectId}/${yearId}/memorize-mode`
    );
  }, [subjectId, yearId]);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb */}
      <div className="w-full px-4 pt-4 pb-4">
        <div className="w-full max-w-[1100px] mx-auto">
          <Breadcrumb
            subject={exam?.subject}
            year={exam?.year.toString() ?? ""}
            subjectHref={`/exam/${subjectId}/year`}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        {/* Question Info */}
        <div className="w-full max-w-[1100px]">
          <p className="text-sm text-[#6B7280]">
             암기모드 | {currentIndex + 1} /{" "}
            {questions.length}
          </p>
        </div>

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
              correctAnswer={currentQuestion.correctAnswers}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
              actionButtonText=""
            />
          </div>
        )}

        {/* 해설 영역 - 정답 확인 이후에만 노출 (전역 토글) */}
        {showResult && currentQuestion?.explanation && (
          <div className="w-full max-w-[1066px] mt-6">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[#101828]">해설</h3>
                  <Toggle
                    checked={isExplanationVisible}
                    onChange={setIsExplanationVisible}
                    label="해설 표시"
                  />
                </div>
              </div>
              {isExplanationVisible && (
                <div className="text-[#364153] leading-7 [&_a]:text-[#155DFC] [&_a]:underline [&_code]:rounded [&_code]:bg-[#F3F4F6] [&_code]:px-1 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc">
                  <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Navigation Buttons */}
        <div className="w-full max-w-[896px] mt-8">
          <ExamNavButtons
            onPrevClick={handlePrev}
            onAnswerClick={showResult ? handleResetQuestion : handleShowAnswer}
            onNextClick={handleNext}
            prevDisabled={isFirstQuestion}
            answerDisabled={!showResult && !hasSelectedAnswer}
            nextDisabled={isLastQuestion}
            answerLabel={showResult ? "다시 풀기" : "정답 확인"}
          />
        </div>
      </main>

      {/* 챗봇 - 암기 모드에서만, 현재 문제 ID 전달 */}
      <button
        type="button"
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-50 pl-2 size-14 rounded-full shadow-lg transition bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#5D50FF] focus:ring-offset-2 cursor-pointer"
        aria-label="챗봇"
      >
        <Image
          src="/chatbot.png"
          alt="챗봇"
          className="size-full object-contain"
          width={56}
          height={56}
        />
      </button>
      <ChatbotPanel
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        questionId={currentQuestion?.id ?? undefined}
        subjectId={subjectId}
        yearId={yearId}
        subjectLabel={exam?.subject}
        yearLabel={exam?.year ? `${exam.year}년도` : undefined}
      />
    </div>
  );
};
