"use client";
import { useState, useCallback, useMemo } from "react";
import { ExamNavButtons, QuestionCard } from "@/components/ui";
import { useExamQuestionsWithAnswersQuery } from "../hooks/service";

type Props = {
  subjectId?: string;
  yearId?: string;
};

export const MemorizeModePage = ({ subjectId, yearId }: Props) => {
  const examId = yearId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);

  // API 호출
  const { data, isLoading, isError } = useExamQuestionsWithAnswersQuery(
    examId ?? ""
  );

  const exam = data?.exam;
  const questions = data?.questions ?? [];
  const currentQuestion = questions[currentIndex];
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

  const handlePrev = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [isFirstQuestion]);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [isLastQuestion]);

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
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Question Info */}
        <div className="w-full max-w-[1066px] mb-4">
          <p className="text-sm text-[#6B7280]">
            {exam?.title ?? "-"} | 암기모드 | {currentIndex + 1} /{" "}
            {questions.length}
          </p>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="w-full max-w-[1066px]">
            <QuestionCard
              size="full"
              question={currentQuestion.text}
              answers={formattedAnswers}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correctAnswers}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
              actionButtonText=""
            />
          </div>
        )}

        {/* 해설 영역 - 정답 확인 이후에만 노출 */}
        {showResult && currentQuestion?.explanation && (
          <div className="w-full max-w-[1066px] mt-6">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-[#101828]">해설</h3>
              </div>
              <p className="text-[#364153] leading-7">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="w-full max-w-[896px] mt-8">
          <ExamNavButtons
            onPrevClick={handlePrev}
            onAnswerClick={handleShowAnswer}
            onNextClick={handleNext}
            prevDisabled={isFirstQuestion}
            answerDisabled={!hasSelectedAnswer || showResult}
            nextDisabled={isLastQuestion}
            answerLabel={showResult ? "정답 확인됨" : "정답 확인"}
          />
        </div>
      </main>
    </div>
  );
};
