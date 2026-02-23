"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  MessageCircle,
  BookOpen,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts";

const CHATBOT_QUESTION_LIMIT = 10;
const STORAGE_KEY_PREFIX = "qknou_chatbot_questions_";

interface ChatbotPanelProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "학습 도우미는 무엇인가요?",
  "암기 모드 사용법을 알려주세요.",
];

function getQuestionCountKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function getStoredQuestionCount(userId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(getQuestionCountKey(userId));
  const n = parseInt(raw ?? "0", 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

export function ChatbotPanel({ open, onClose }: ChatbotPanelProps) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setStorageVersion] = useState(0);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(null);

  const questionCount = userId ? getStoredQuestionCount(userId) : 0;
  const canAsk = questionCount < CHATBOT_QUESTION_LIMIT;

  const persistCount = useCallback(
    (count: number) => {
      if (!userId) return;
      localStorage.setItem(getQuestionCountKey(userId), String(count));
      setStorageVersion((v) => v + 1);
    },
    [userId]
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  }, [messages.length, loading]);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (!canAsk) {
        setLimitReachedMessage(`질문 한도를 모두 사용했어요. (${CHATBOT_QUESTION_LIMIT}개)`);
        return;
      }
      setLimitReachedMessage(null);
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setInput("");
      persistCount(questionCount + 1);
      setLoading(true);
      // TODO: 실제 API 연동 시 여기서 요청 후 응답 추가
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "답변 기능은 준비 중이에요. 곧 만나요! 😊" },
        ]);
        setLoading(false);
      }, 1200);
    },
    [canAsk, questionCount, persistCount]
  );

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
            <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <div className="relative size-full">
                <Image
                  src="/chatbot.png"
                  alt="챗봇"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
            </div>
            <span className="font-semibold text-[#111827]">AI 학습 도우미</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Content - scroll */}
        <div
          ref={scrollAreaRef}
          className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
        >
          {/* Welcome block - 처음만 */}
          {messages.length === 0 && (
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
                질문은 1인당 하루 {CHATBOT_QUESTION_LIMIT}개까지 가능해요.
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
          )}

          {/* 채팅 메시지 목록 */}
          <div className="mb-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role === "bot" && (
                  <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E7EB]">
                    <div className="relative size-full">
                      <Image
                        src="/chatbot.png"
                        alt=""
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "rounded-tr-md bg-[#5D50FF] text-white"
                      : "rounded-tl-md bg-[#F3F4F6] text-[#374151]"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* 로딩 중: loading-chatbot 이미지 */}
            {loading && (
              <div className="flex gap-2">
                <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E7EB]">
                  <div className="relative size-full">
                    <Image
                      src="/chatbot.png"
                      alt="답변 생성 중"
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-[#F3F4F6] px-4 py-3">
                  <span className="size-2 animate-bounce rounded-full bg-[#6B7280]" style={{ animationDelay: "0ms" }} />
                  <span className="size-2 animate-bounce rounded-full bg-[#6B7280]" style={{ animationDelay: "150ms" }} />
                  <span className="size-2 animate-bounce rounded-full bg-[#6B7280]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* 한도 안내 / 추천 질문 */}
          {limitReachedMessage && (
            <p className="mb-3 text-sm text-amber-600">{limitReachedMessage}</p>
          )}
          {messages.length === 0 && (
            <>
              <p className="mb-2 text-xs text-[#6B7280]">자주 묻는 질문</p>
              <div className="mb-6 flex flex-col items-end gap-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleSend(text)}
                    disabled={!canAsk}
                    className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#F3F4F6] px-4 py-2.5 text-left text-sm text-[#374151] hover:bg-[#E5E7EB] disabled:opacity-60"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-3">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={
                  canAsk
                    ? "AI에게 질문해 주세요."
                    : `오늘 질문 한도가 모두 소진되었어요 (${CHATBOT_QUESTION_LIMIT}/${CHATBOT_QUESTION_LIMIT})`
                }
                disabled={!canAsk}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-70"
                aria-label="메시지 입력"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={!canAsk || loading}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5D50FF] text-white hover:bg-[#4a3ecc] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="보내기"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            {canAsk
              ? `남은 질문 ${CHATBOT_QUESTION_LIMIT - questionCount}회 · AI는 한정된 데이터에 기반하니 중요한 정보는 추가 확인을 권장해요.`
              : "AI는 한정된 데이터에 기반하니, 중요한 정보는 추가 확인을 권장해요."}
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
