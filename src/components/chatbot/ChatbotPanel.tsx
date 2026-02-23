"use client";

import {
  ChevronLeft,
  MessageCircle,
  BookOpen,
  Paperclip,
  Smile,
  Send,
  X,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotPanelProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "학습 도우미는 무엇인가요?",
  "암기 모드 사용법을 알려주세요.",
];

export function ChatbotPanel({ open, onClose }: ChatbotPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel: 모바일 우선, 오른쪽에서 슬라이드 */}
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[400px] flex-col rounded-l-2xl bg-white shadow-xl",
          "transition-transform duration-300 ease-out"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="챗봇"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
            aria-label="닫기"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#5D50FF]/10">
              <Bot className="size-4 text-[#5D50FF]" />
            </div>
            <span className="font-semibold text-[#111827]">AI 학습 도우미</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Content - scroll */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          {/* Welcome block */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1.5">
              <MessageCircle className="size-4 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#374151]">
                AI 학습 도우미
              </span>
            </div>
            <p className="mb-3 text-[#374151] leading-relaxed">
              안녕하세요! 😊 학습이나 암기 모드에 대해 궁금한 점을 남겨주시면
              빠르게 안내드리겠습니다.
            </p>
            <ul className="mb-4 space-y-1 text-sm text-[#6B7280]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-sm bg-[#111827]" />
                AI 챗봇: 24시간 연중무휴
              </li>
            </ul>
            <p className="mb-3 text-sm text-[#374151]">
              학습 방법이 처음이시라면? 도움말을 통해 맞춤 안내가 가능합니다. 🙌
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#E5E7EB]"
              >
                <MessageCircle className="size-4" />
                상담받기
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-2 text-sm font-medium text-white hover:bg-[#059669]"
              >
                <BookOpen className="size-4" />
                학습 가이드
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          <p className="mb-2 text-xs text-[#6B7280]">자주 묻는 질문</p>
          <div className="mb-6 flex flex-col items-end gap-2">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                type="button"
                className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#F3F4F6] px-4 py-2.5 text-left text-sm text-[#374151] hover:bg-[#E5E7EB]"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-3">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
              {/* <button
                type="button"
                className="rounded p-1 text-[#6B7280] hover:bg-[#E5E7EB]"
                aria-label="첨부"
              >
                <Paperclip className="size-4" />
              </button> */}
              <input
                type="text"
                placeholder="AI에게 질문해 주세요."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                aria-label="메시지 입력"
              />
            </div>
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5D50FF] text-white hover:bg-[#4a3ecc]"
              aria-label="보내기"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            AI는 한정된 데이터에 기반하니, 중요한 정보는 추가 확인을 권장해요.
          </p>
        </div>

        {/* Close X - bottom right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute bottom-28 right-4 flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-md hover:bg-[#F9FAFB]"
          aria-label="챗봇 닫기"
        >
          <X className="size-5 text-[#374151]" />
        </button>
      </div>
    </>
  );
}
