"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { ExamNavButtons, QuestionCard, Button, Breadcrumb } from "@/shared/ui";
import { useExamQuestionsWithAnswersQuery } from "@/modules/exam";

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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  // 정답 기억하기 상태 (questionId -> { showResult, selectedAnswer })
  const [rememberedAnswers, setRememberedAnswers] = useState<
    Record<
      number,
      { showResult: boolean; selectedAnswer: string | number | null }
    >
  >({});

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101828]">해설</h3>
                {/* 문제 다시 풀기 버튼 */}
                <Button
                  data-testid="reset-button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetQuestion}
                >
                  문제 다시 풀기
                </Button>
              </div>
              <p className="text-[#364153] leading-7">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* 문제 다시 풀기 버튼 - 해설이 없지만 정답이 보일 때 */}
        {showResult && !currentQuestion?.explanation && (
          <div className="w-full max-w-[1066px] mt-6 flex justify-end">
            <Button
              data-testid="reset-button"
              variant="outline"
              size="sm"
              onClick={handleResetQuestion}
            >
              문제 다시 풀기
            </Button>
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
