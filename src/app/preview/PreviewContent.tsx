"use client";

import { useState, useCallback } from "react";
import { QuestionCard } from "@/components/ui";
import type { PreviewQuestion } from "./page";

type Props = {
  questions: PreviewQuestion[];
};

function useQuestionState() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const reset = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, []);
  return { selectedAnswer, setSelectedAnswer, showResult, setShowResult, reset };
}

function QuestionPreviewItem({ question, index }: { question: PreviewQuestion; index: number }) {
  const { selectedAnswer, setSelectedAnswer, showResult, setShowResult, reset } =
    useQuestionState();

  const formattedAnswers = question.choices.map((c) => ({
    value: c.number,
    label: c.text,
    imageUrls: c.imageUrls,
  }));

  return (
    <div className="border border-[#E5E7EB] rounded-[16px] p-6 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
          #{question.questionNumber} · p.{question.page}
        </span>
        {question.needsNonTextRecovery && (
          <span className="px-2.5 py-1 bg-[#FFFBEB] border border-[#FCD34D] rounded-full text-xs text-[#92400E]">
            ⚠️ 이미지 복구 필요
          </span>
        )}
      </div>
      <QuestionCard
        size="full"
        question={`${index + 1}. ${question.questionText}`}
        example={question.exampleText ?? undefined}
        sharedExample={question.sharedExample ?? undefined}
        imageUrls={question.questionImageUrls}
        answers={formattedAnswers}
        selectedAnswer={selectedAnswer}
        correctAnswer={[]}
        showResult={showResult}
        onAnswerSelect={(v) => { if (!showResult) setSelectedAnswer(v); }}
        actionButtonText={showResult ? "다시 풀기" : "정답 확인"}
        actionButtonDisabled={!showResult && selectedAnswer === null}
        onActionClick={showResult ? reset : () => setShowResult(true)}
      />
    </div>
  );
}

export function PreviewContent({ questions }: Props) {
  const [filter, setFilter] = useState<"all" | "recovery">("all");

  const filtered = filter === "recovery"
    ? questions.filter((q) => q.needsNonTextRecovery)
    : questions;

  return (
    <div className="min-h-screen bg-[#F3F4F6] px-4 py-8">
      <div className="max-w-[900px] mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#101828] mb-1">문항 렌더링 프리뷰</h1>
          <p className="text-sm text-[#6B7280]">
            252 알고리즘 3학년 3교시 — 총 {questions.length}문항
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#155DFC] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#364153] hover:bg-[#F9FAFB]"
              }`}
            >
              전체 ({questions.length})
            </button>
            <button
              onClick={() => setFilter("recovery")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "recovery"
                  ? "bg-[#D97706] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#364153] hover:bg-[#F9FAFB]"
              }`}
            >
              복구 필요 ({questions.filter((q) => q.needsNonTextRecovery).length})
            </button>
          </div>
        </div>

        {/* 문항 목록 */}
        <div className="flex flex-col gap-6">
          {filtered.map((q, i) => (
            <QuestionPreviewItem
              key={q.questionNumber}
              question={q}
              index={questions.indexOf(q)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
