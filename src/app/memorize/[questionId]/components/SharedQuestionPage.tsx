"use client";

import { useCallback, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { QuestionCard, buttonVariants } from "@/components/ui";
import { QuestionActionIcons } from "@/components/question-actions/QuestionActionIcons";
import { ReportBugLink } from "@/components/question-actions/ReportBugLink";
import {
  FeedbackModal,
  useFeedbackModal,
} from "@/components/feedback/FeedbackModal";
import { ExplanationGate } from "@/components/ads/ExplanationGate";
import {
  ShareEntryAdModal,
  useShareEntryAdModal,
} from "@/components/ads/ShareEntryAdModal";
import { SITE_URL } from "@/constants";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  examDetailContentAreaClassName,
  examDetailMaxW,
  examDetailStyle,
} from "@/lib/exam-side-ad-layout";
import { useCopyProtection } from "@/lib/useCopyProtection";
import { trackEvent } from "@/lib/analytics";

import { useQuestionQuery } from "../hooks/service";

type Props = {
  questionId: string;
};

export const SharedQuestionPage = ({ questionId }: Props) => {
  useCopyProtection();
  const { data, isLoading, isError, error } = useQuestionQuery(questionId);
  const {
    feedbackModalOpen,
    feedbackModalDefaultType,
    feedbackModalQuestionId,
    feedbackModalQuestionDisplayNumber,
    openFeedbackModal,
    closeFeedbackModal,
  } = useFeedbackModal();
  const shareEntryAdModal = useShareEntryAdModal();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 다른 문항으로 이동해도 같은 컴포넌트 인스턴스가 재사용될 수 있어, 문항이
  // 바뀌면 암기모드와 동일하게 선택/결과 상태를 초기화한다. effect 대신 렌더 중
  // 비교해 리셋하는 방식(React 공식 권장 패턴)을 써서 setState-in-effect를 피한다.
  const [renderedQuestionId, setRenderedQuestionId] = useState(data?.id);
  if (data?.id !== renderedQuestionId) {
    setRenderedQuestionId(data?.id);
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

  const handleMoreQuestionsClick = useCallback(() => {
    trackEvent("share_page_more_questions_click", {
      question_id: data?.id ?? "",
    });
  }, [data?.id]);

  const formattedAnswers = useMemo(() => {
    if (!data?.choices) return [];
    return data.choices.map((choice) => ({
      value: choice.number,
      label: choice.text,
      imageUrls: choice.imageUrls,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-[#6B7280]">문제를 불러오는 중...</p>
      </div>
    );
  }

  if (isError && error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-red-500">문제를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const shareUrl = `${SITE_URL}/memorize/${data.id}`;

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col">
      <div
        style={examDetailStyle}
        className={cn("flex flex-1 flex-col", examDetailContentAreaClassName)}
      >
        <main className="flex-1 flex flex-col items-center px-4 py-6">
          <div
            className={cn(
              examDetailMaxW[896],
              "flex items-center justify-between"
            )}
          >
            <p className="text-sm text-[#6B7280]">
              {data.exam.subject} {data.exam.year}년 | 문항 {data.questionNumber}번
            </p>
            <QuestionActionIcons
              questionId={data.id}
              shareUrl={shareUrl}
              bookmarkActive={Boolean(data.isBookmarked)}
            />
          </div>

          <div className={examDetailMaxW[896]}>
            <QuestionCard
              size="full"
              question={`${data.questionNumber}. ${data.text}`}
              sharedExample={data.sharedExample}
              example={data.example}
              imageUrls={data.imageUrls}
              answers={formattedAnswers}
              selectedAnswer={selectedAnswer}
              correctAnswer={data.correctAnswers}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
              actionButtonText="정답 확인"
              actionButtonDisabled={selectedAnswer === null}
              onActionClick={() => setShowResult(true)}
            />
            <div className="mt-4 flex items-center justify-between gap-2">
              <ReportBugLink
                onClick={() =>
                  openFeedbackModal({
                    type: "question_bug",
                    questionId: data.id,
                    questionDisplayNumber: data.questionNumber,
                  })
                }
              />
              <Link
                href="/"
                onClick={handleMoreQuestionsClick}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                더 많은 문제보기
              </Link>
            </div>
          </div>

          {showResult && (
            <div className={cn(examDetailMaxW[896], "mt-6")}>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-6">
                <h3 className="font-semibold text-[#101828] mb-3">해설</h3>
                {data.explanation ? (
                  <ExplanationGate>
                    <div className="text-[#364153] leading-7 [&_a]:text-[#155DFC] [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc">
                      <ReactMarkdown>{data.explanation}</ReactMarkdown>
                    </div>
                  </ExplanationGate>
                ) : (
                  <p className="text-[#6B7280]">등록된 해설이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <FeedbackModal
        open={feedbackModalOpen}
        onClose={closeFeedbackModal}
        defaultType={feedbackModalDefaultType}
        questionId={feedbackModalQuestionId}
        questionDisplayNumber={feedbackModalQuestionDisplayNumber}
      />

      <ShareEntryAdModal
        open={shareEntryAdModal.open}
        onClose={shareEntryAdModal.onClose}
      />
    </div>
  );
};
