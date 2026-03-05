"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  MessageCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts";
import { Select } from "@/components/ui";

const CHATBOT_QUESTION_LIMIT = 10;
const STORAGE_KEY_PREFIX = "qknou_chatbot_questions_";

type TutorIntent = "define" | "compare" | "recommend" | "general";

type TutorHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type TutorRecommendation = {
  id: number;
  questionNumber: number;
  text: string;
  examTitle: string;
  year: number;
};

type TutorResponse = {
  success: boolean;
  data?: {
    answer: string;
    intent: TutorIntent;
    recommendations?: TutorRecommendation[];
  };
};

const INTENT_OPTIONS = [
  { value: "define", label: "개념 설명" },
  { value: "compare", label: "개념 비교" },
  { value: "recommend", label: "관련 문제 추천" },
  { value: "general", label: "일반 학습 질문" },
] as const;

interface ChatbotPanelProps {
  open: boolean;
  onClose: () => void;
  /** 현재 문제 ID (암기 모드 등에서 전달 시 튜터 API 사용) */
  questionId?: number;
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

export function ChatbotPanel({ open, onClose, questionId }: ChatbotPanelProps) {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const storageUserKey = useMemo(() => String(user?.id ?? "anonymous"), [user?.id]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(null);
  const [intent, setIntent] = useState<TutorIntent>("define");

  const canAskByLimit = questionCount < CHATBOT_QUESTION_LIMIT;
  const hasQuestionContext = questionId != null;
  const canAsk = isLoggedIn && (hasQuestionContext || canAskByLimit);

  useEffect(() => {
    setQuestionCount(getStoredQuestionCount(storageUserKey));
  }, [storageUserKey]);

  const persistCount = useCallback(
    (count: number) => {
      localStorage.setItem(getQuestionCountKey(storageUserKey), String(count));
      setQuestionCount(count);
    },
    [storageUserKey]
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

  // GPT 보조(fallback) 호출 - /api/chatbot, 1인당 10회 제한
  const callGptFallback = useCallback(
    async (historyMessages: { role: "user" | "bot"; text: string }[]) => {
      if (!canAskByLimit) {
        setLimitReachedMessage(
          `GPT 보조 사용 한도를 모두 사용했어요. (${CHATBOT_QUESTION_LIMIT}회)`
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "튜터에서 충분한 정보를 찾지 못했고, GPT 보조 사용 한도도 모두 소진되었습니다.",
          },
        ]);
        return;
      }

      setLimitReachedMessage(null);
      persistCount(questionCount + 1);
      setLoading(true);
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: historyMessages,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "GPT 보조 응답 생성에 실패했습니다.");
        }
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: message,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [canAskByLimit, persistCount, questionCount]
  );

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (!isLoggedIn) {
        setLimitReachedMessage("로그인 사용자만 이용 가능합니다.");
        return;
      }

      // 현재 문제 기반 튜터 플로우: /api/tutor/chat 우선 호출
      if (hasQuestionContext && questionId != null) {
        setLimitReachedMessage(null);
        const historyMessages = [
          ...messages,
          { role: "user" as const, text: trimmed },
        ];
        setMessages(historyMessages);
        setInput("");
        setLoading(true);

        try {
          const tutorHistory: TutorHistoryItem[] = historyMessages
            .slice(0, -1)
            .map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.text,
            }));

          const res = await fetch("/api/tutor/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId: questionId!,
              message: trimmed,
              history: tutorHistory.length ? tutorHistory : undefined,
            }),
          });

          const data: TutorResponse = await res.json();
          const ok = res.ok && data?.success;
          const payload = data?.data;
          const recommendations = payload?.recommendations ?? [];
          const isRecommendIntent = payload?.intent === "recommend";
          const hasRecommendationResult =
            !isRecommendIntent || recommendations.length > 0;

          if (ok && payload && hasRecommendationResult) {
            let botText = payload.answer;

            if (isRecommendIntent && recommendations.length > 0) {
              const list = recommendations
                .slice(0, 5)
                .map(
                  (r, index) =>
                    `${index + 1}. [${r.year}] ${r.examTitle} ${r.questionNumber}번 - ${r.text}`
                )
                .join("\n");
              botText += `\n\n추천 문제 목록:\n${list}`;
            }

            setMessages((prev) => [...prev, { role: "bot", text: botText }]);
            setLoading(false);
            return;
          }

          // 추천 의도인데 추천 결과가 없거나, success=false/HTTP 에러인 경우 GPT 보조로 fallback
          await callGptFallback(historyMessages);
        } catch {
          await callGptFallback([
            ...messages,
            { role: "user" as const, text: trimmed },
          ]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // 현재 문제 정보가 없을 때는 기존 GPT 챗봇 플로우만 사용
      if (!canAskByLimit) {
        setLimitReachedMessage(
          `질문 한도를 모두 사용했어요. (${CHATBOT_QUESTION_LIMIT}개)`
        );
        return;
      }

      setLimitReachedMessage(null);
      const historyMessages = [
        ...messages,
        { role: "user" as const, text: trimmed },
      ];
      setMessages(historyMessages);
      setInput("");
      persistCount(questionCount + 1);
      setLoading(true);
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: historyMessages,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "챗봇 응답 생성에 실패했습니다.");
        }
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: message,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      isLoggedIn,
      hasQuestionContext,
      questionId,
      messages,
      callGptFallback,
      canAskByLimit,
      persistCount,
      questionCount,
    ]
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
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap wrap-break-word",
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
              <p className="text-end mb-2 text-xs text-[#6B7280]">자주 묻는 질문</p>
              <div className="mb-6 flex flex-col items-end gap-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => void handleSend(text)}
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
          {/* 질문 유형 선택 - 로그인 사용자만 */}
          {isLoggedIn && (
            <div className="mb-2 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#4B5563]">질문 유형</span>
                <Select
                  options={[...INTENT_OPTIONS]}
                  value={intent}
                  onChange={(v) => setIntent(v as TutorIntent)}
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                {intent === "define" &&
                  '예: "DI가 뭐야?"처럼 하나의 개념을 물어보세요.'}
                {intent === "compare" &&
                  '예: "DI랑 IoC 차이가 뭐야?"처럼 두 개념을 함께 적어주세요.'}
                {intent === "recommend" &&
                  '예: "비슷한 문제 더 줘"처럼 현재 문제와 관련된 문제를 요청해 보세요.'}
                {intent === "general" &&
                  "시험 전략, 학습 방법 등 전반적인 질문을 자유롭게 남겨주세요."}
              </p>
            </div>
           )}
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void handleSend(input);
                  }
                }}
                placeholder={
                  !isLoggedIn
                    ? "로그인 사용자만 이용 가능합니다."
                    : hasQuestionContext
                    ? "현재 문제를 기준으로 AI 튜터에게 질문해 주세요."
                    : canAskByLimit
                    ? "AI에게 질문해 주세요."
                    : `오늘 질문 한도가 모두 소진되었어요 (${CHATBOT_QUESTION_LIMIT}/${CHATBOT_QUESTION_LIMIT})`
                }
                disabled={
                  !isLoggedIn || (!hasQuestionContext && !canAskByLimit)
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-70"
                aria-label="메시지 입력"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSend(input)}
              disabled={
                !isLoggedIn || (!hasQuestionContext && !canAskByLimit) || loading
              }
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5D50FF] text-white hover:bg-[#4a3ecc] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="보내기"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            {!isLoggedIn
              ? "로그인 사용자만 이용 가능합니다3."
              : hasQuestionContext
              ? canAskByLimit
                ? `GPT 보조 설명은 ${CHATBOT_QUESTION_LIMIT - questionCount}회까지 이용할 수 있어요. 튜터는 계속 사용할 수 있습니다.`
                : "GPT 보조 사용 한도는 모두 소진되었지만, 튜터는 계속 사용할 수 있습니다."
              : canAskByLimit
              ? `남은 질문 ${CHATBOT_QUESTION_LIMIT - questionCount}회 · AI는 한정된 데이터에 기반하니 중요한 정보는 추가 확인을 권장해요.`
              : "AI는 한정된 데이터에 기반하니, 중요한 정보는 추가 확인을 권장해요."}
          </p>
        </div>
      </div>
    </>
  );
}
