"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft,
  MessageCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts";

const CHATBOT_QUESTION_LIMIT = 5;
// API 요청에 포함할 과거 대화 개수(현재 질문 제외)
const CHAT_HISTORY_CONTEXT_LIMIT = 2;
const STORAGE_KEY_PREFIX = "qknou_chatbot_questions_";
const CHAT_HISTORY_KEY_PREFIX = "qknou_chatbot_history_";
const CHAT_HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LOGIN_CTA_TEXT_COLOR = "#155DFC";
const LOGIN_CTA_CLASS =
  "cursor-pointer font-medium hover:underline hover:underline-offset-2";

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

type ChatMessage = { role: "user" | "bot"; text: string };

type ChatThread = {
  threadId: string;
  subjectId?: string;
  yearId?: string;
  subjectLabel?: string;
  yearLabel?: string;
  messages: ChatMessage[];
  updatedAt: number;
};

type StoredChatHistory = {
  version: 2;
  threads: ChatThread[];
};

type StoredDailyQuestionCount = {
  count: number;
  // 일일 제한 초기화를 위한 로컬 날짜 키 (YYYY-MM-DD)
  dateKey: string;
};

interface ChatbotPanelProps {
  open: boolean;
  onClose: () => void;
  /** 현재 문제 ID (암기 모드 등에서 전달 시 튜터 API 사용) */
  questionId?: number;
  subjectId?: string;
  yearId?: string;
  subjectLabel?: string;
  yearLabel?: string;
}

const SUGGESTIONS = [
  "학습 도우미는 무엇인가요?",
  "암기 모드 사용법을 알려주세요.",
];

const PRESET_ANSWERS: Record<string, string> = {
  "학습 도우미는 무엇인가요?": `
## 학습 도우미란?

학습 도우미는 학습자가 목표를 달성하도록 **지원하고 안내하는 사람/도구**를 의미합니다.

- 어려운 개념을 쉽게 설명
- 문제 풀이 과정에서 막힌 부분 보조
- 학습 계획 수립과 복습 루틴 제안

학습 도우미는 개인 튜터, 스터디 그룹, 온라인 학습 플랫폼 등 다양한 형태로 제공될 수 있으며, 학습자 상황에 맞춘 지원으로 **이해도·자율성·동기**를 높이는 데 기여합니다.

결론적으로 학습 도우미는 효과적인 학습을 위한 중요한 자원입니다.
`.trim(),
  "암기 모드 사용법을 알려주세요.": `
## 암기 모드 사용법

암기 모드는 문제를 반복 학습하면서 정답과 해설을 빠르게 점검하는 모드입니다.

### 1. 문제 확인
- 현재 문제를 읽고 선택지를 검토합니다.

### 2. 답안 선택
- 정답이라고 생각하는 보기를 선택합니다.

### 3. 정답 확인
- **정답 확인** 버튼을 눌러 정답/오답 여부를 확인합니다.

### 4. 해설 학습
- 해설 표시를 켜고 핵심 개념을 확인합니다.
- 필요한 경우 다시 풀기로 해당 문제를 재시도합니다.

### 5. 반복 학습
- 이전/다음으로 이동하며 취약 문제를 반복합니다.
- 틀린 문제 위주로 여러 번 회독하면 암기 효율이 높아집니다.

## 추천 학습 루틴
- 1회차: 전 범위 빠르게 풀기
- 2회차: 오답/헷갈린 문제 집중
- 3회차: 해설 없이 재도전
`.trim(),
};

function getQuestionCountKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMsUntilNextLocalMidnight(now = new Date()) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

function getChatHistoryKey(userId: string) {
  return `${CHAT_HISTORY_KEY_PREFIX}${userId}`;
}

function buildThreadId(subjectId?: string, yearId?: string) {
  // 과목/연도별 대화 스레드 키
  if (subjectId && yearId) return `${subjectId}:${yearId}`;
  return "general";
}

function formatThreadTitle(thread: ChatThread) {
  const subject = thread.subjectLabel ?? thread.subjectId ?? "일반";
  const year = thread.yearLabel ?? thread.yearId ?? "-";
  return `${subject} · ${year}`;
}

function getStoredQuestionCount(userId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(getQuestionCountKey(userId));
  if (!raw) return 0;

  // 레거시 포맷(숫자 문자열) 호환
  const legacyNumber = parseInt(raw, 10);
  if (!Number.isNaN(legacyNumber)) {
    return Math.max(0, legacyNumber);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDailyQuestionCount>;
    if (typeof parsed.count !== "number" || typeof parsed.dateKey !== "string") {
      return 0;
    }
    if (parsed.dateKey !== getLocalDateKey()) {
      return 0;
    }
    return Math.max(0, parsed.count);
  } catch {
    return 0;
  }
}

function getStoredChatHistory(userId: string): StoredChatHistory {
  const empty: StoredChatHistory = { version: 2, threads: [] };
  if (typeof window === "undefined") return empty;
  const raw = localStorage.getItem(getChatHistoryKey(userId));
  if (!raw) return empty;

  try {
    const parsed = JSON.parse(raw) as unknown;

    // v1 마이그레이션: 단일 messages 구조 -> general 스레드 1개
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("version" in parsed) ||
      (parsed as { version?: unknown }).version !== 2
    ) {
      const legacy = parsed as { messages?: unknown; updatedAt?: unknown };
      const messages = Array.isArray(legacy.messages)
        ? legacy.messages.filter(
            (m): m is ChatMessage =>
              (m?.role === "user" || m?.role === "bot") &&
              typeof m?.text === "string"
          )
        : [];
      const updatedAt =
        typeof legacy.updatedAt === "number" ? legacy.updatedAt : Date.now();
      if (Date.now() - updatedAt > CHAT_HISTORY_TTL_MS) {
        localStorage.removeItem(getChatHistoryKey(userId));
        return empty;
      }
      return {
        version: 2,
        threads: [
          {
            threadId: "general",
            subjectLabel: "일반",
            yearLabel: "-",
            messages,
            updatedAt,
          },
        ],
      };
    }

    // v2: 스레드 목록 구조
    const v2 = parsed as StoredChatHistory;
    const threads = Array.isArray(v2.threads) ? v2.threads : [];
    const validThreads = threads
      .filter((thread) => {
        if (!thread?.threadId || !Array.isArray(thread?.messages)) return false;
        if (
          typeof thread.updatedAt !== "number" ||
          Date.now() - thread.updatedAt > CHAT_HISTORY_TTL_MS
        ) {
          return false;
        }
        return true;
      })
      .map((thread) => ({
        ...thread,
        messages: thread.messages.filter(
          (m): m is ChatMessage =>
            (m?.role === "user" || m?.role === "bot") &&
            typeof m?.text === "string"
        ),
      }))
      // 대화가 없는 빈 스레드는 저장/복원 대상에서 제외
      .filter((thread) => thread.messages.length > 0);

    if (validThreads.length === 0) {
      localStorage.removeItem(getChatHistoryKey(userId));
      return empty;
    }
    return { version: 2, threads: validThreads };
  } catch {
    localStorage.removeItem(getChatHistoryKey(userId));
    return empty;
  }
}

function persistChatHistory(userId: string, data: StoredChatHistory) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getChatHistoryKey(userId), JSON.stringify(data));
}

export function ChatbotPanel({
  open,
  onClose,
  questionId,
  subjectId,
  yearId,
  subjectLabel,
  yearLabel,
}: ChatbotPanelProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const storageUserKey = useMemo(() => String(user?.id ?? "anonymous"), [user?.id]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [showThreadList, setShowThreadList] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const isHistoryHydratedRef = useRef(false);
  const activeThreadId = useMemo(
    () => buildThreadId(subjectId, yearId),
    [subjectId, yearId]
  );
  const isViewingOtherThread =
    selectedThreadId.length > 0 && selectedThreadId !== activeThreadId;
  const selectedThread = useMemo(
    () => threads.find((thread) => thread.threadId === selectedThreadId),
    [threads, selectedThreadId]
  );
  const displayedMessages = useMemo(
    () => (isViewingOtherThread ? selectedThread?.messages ?? [] : messages),
    [isViewingOtherThread, selectedThread?.messages, messages]
  );

  const canAskByLimit = questionCount < CHATBOT_QUESTION_LIMIT;
  const hasQuestionContext = questionId != null;
  const canAsk = isLoggedIn && canAskByLimit;

  useEffect(() => {
    setQuestionCount(getStoredQuestionCount(storageUserKey));
  }, [storageUserKey]);

  useEffect(() => {
    // 사용자 로컬 시간 기준 자정(AM 12:00)마다 일일 질문 횟수 리셋
    let timer: number | undefined;
    const scheduleDailyReset = () => {
      timer = window.setTimeout(() => {
        const payload: StoredDailyQuestionCount = {
          count: 0,
          dateKey: getLocalDateKey(),
        };
        localStorage.setItem(
          getQuestionCountKey(storageUserKey),
          JSON.stringify(payload)
        );
        setQuestionCount(0);
        scheduleDailyReset();
      }, getMsUntilNextLocalMidnight() + 100);
    };
    scheduleDailyReset();

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [storageUserKey]);

  useEffect(() => {
    // 사용자/과목/연도 기준 스레드 복원
    isHistoryHydratedRef.current = false;
    const stored = getStoredChatHistory(storageUserKey);
    setThreads(stored.threads);
    const currentThread = stored.threads.find(
      (thread) => thread.threadId === activeThreadId
    );
    setMessages(currentThread?.messages ?? []);
    setSelectedThreadId(activeThreadId);
    isHistoryHydratedRef.current = true;
  }, [storageUserKey, activeThreadId]);

  useEffect(() => {
    if (!isHistoryHydratedRef.current) return;
    if (messages.length === 0) return;

    // 현재 스레드 메시지 변경 시 로컬 저장소 동기화
    setThreads((prev) => {
      const now = Date.now();
      const index = prev.findIndex((thread) => thread.threadId === activeThreadId);
      const nextThread: ChatThread = {
        threadId: activeThreadId,
        subjectId,
        yearId,
        subjectLabel,
        yearLabel,
        messages,
        updatedAt: now,
      };
      const next =
        index >= 0
          ? prev.map((thread, i) => (i === index ? { ...thread, ...nextThread } : thread))
          : [...prev, nextThread];
      persistChatHistory(storageUserKey, { version: 2, threads: next });
      return next;
    });
  }, [
    storageUserKey,
    messages,
    activeThreadId,
    subjectId,
    yearId,
    subjectLabel,
    yearLabel,
  ]);

  const persistCount = useCallback(
    (count: number) => {
      const payload: StoredDailyQuestionCount = {
        count,
        dateKey: getLocalDateKey(),
      };
      localStorage.setItem(getQuestionCountKey(storageUserKey), JSON.stringify(payload));
      setQuestionCount(count);
    },
    [storageUserKey]
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  }, [displayedMessages, loading, isTyping]);

  useEffect(() => {
    return () => {
      clearTypingTimer();
    };
  }, [clearTypingTimer]);

  const appendBotMessageWithTyping = useCallback(
    async (fullText: string) => {
      if (!fullText) return;
      clearTypingTimer();

      let targetIndex = -1;
      setMessages((prev) => {
        targetIndex = prev.length;
        return [...prev, { role: "bot", text: "" }];
      });

      setIsTyping(true);
      await new Promise<void>((resolve) => {
        let cursor = 0;
        typingTimerRef.current = setInterval(() => {
          cursor += 1;

          setMessages((prev) => {
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const next = [...prev];
            next[targetIndex] = {
              ...next[targetIndex],
              text: fullText.slice(0, cursor),
            };
            return next;
          });

          if (cursor >= fullText.length) {
            clearTypingTimer();
            setIsTyping(false);
            resolve();
          }
        }, 18);
      });
    },
    [clearTypingTimer]
  );

  // GPT 보조(fallback) 호출 - 질문 1회 차감 후 내부적으로 사용
  const callGptFallback = useCallback(
    async (historyMessages: ChatMessage[]) => {
      setLimitReachedMessage(null);
      setLoading(true);
      try {
        // 과거 컨텍스트는 최근 N개만 전달
        const apiMessages = historyMessages.slice(
          -(CHAT_HISTORY_CONTEXT_LIMIT + 1)
        );
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "GPT 보조 응답 생성에 실패했습니다.");
        }
        await appendBotMessageWithTyping(data.reply);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
        await appendBotMessageWithTyping(message);
      } finally {
        setLoading(false);
      }
    },
    [appendBotMessageWithTyping]
  );

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // 다른 과목/연도 스레드는 조회 전용
      if (isViewingOtherThread) {
        setLimitReachedMessage(
          "조회 전용 대화입니다. 현재 과목/연도 대화에서만 질문할 수 있어요."
        );
        return;
      }

      if (!isLoggedIn) {
        setLimitReachedMessage("로그인 사용자만 이용 가능합니다.");
        return;
      }

      const presetAnswer = PRESET_ANSWERS[trimmed];
      if (presetAnswer) {
        const historyMessages = [
          ...messages,
          { role: "user" as const, text: trimmed },
        ];
        setMessages(historyMessages);
        setInput("");
        setLimitReachedMessage(null);
        await appendBotMessageWithTyping(presetAnswer);
        return;
      }

      if (!canAskByLimit) {
        setLimitReachedMessage(
          `질문 한도를 모두 사용했어요. (${CHATBOT_QUESTION_LIMIT}개)`
        );
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
        persistCount(questionCount + 1);
        setLoading(true);

        try {
          const tutorHistory: TutorHistoryItem[] = historyMessages
            .slice(0, -1)
            // 튜터 history도 최근 N개만 전달
            .slice(-CHAT_HISTORY_CONTEXT_LIMIT)
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

            await appendBotMessageWithTyping(botText);
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
        // 과거 컨텍스트는 최근 N개만 전달
        const apiMessages = historyMessages.slice(
          -(CHAT_HISTORY_CONTEXT_LIMIT + 1)
        );
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "챗봇 응답 생성에 실패했습니다.");
        }
        await appendBotMessageWithTyping(data.reply);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
        await appendBotMessageWithTyping(message);
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
      appendBotMessageWithTyping,
      isViewingOtherThread,
    ]
  );

  if (!open) return null;

  const threadSummaries = [...threads]
    .filter((thread) => thread.threadId !== "general")
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
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
          <button
            type="button"
            onClick={() => setShowThreadList((prev) => !prev)}
            className="rounded-md px-2 py-1 text-xs text-[#4B5563] hover:bg-[#F3F4F6]"
          >
            {showThreadList ? "대화로" : "목록으로"}
          </button>
        </div>

        {/* Content - scroll */}
        <div
          ref={scrollAreaRef}
          className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
        >
          {showThreadList ? (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-[#6B7280]">대화 목록</p>
              {threadSummaries.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">저장된 대화가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {threadSummaries.map((thread) => (
                    <button
                      type="button"
                      key={thread.threadId}
                      onClick={() => {
                        setSelectedThreadId(thread.threadId);
                        setShowThreadList(false);
                      }}
                      className={cn(
                        "block w-full rounded-lg border px-3 py-2 text-left",
                        thread.threadId === selectedThreadId
                          ? "border-[#5D50FF] bg-[#F5F3FF]"
                          : "border-[#E5E7EB] bg-white"
                      )}
                    >
                      <p className="text-sm font-medium text-[#374151]">
                        {formatThreadTitle(thread)}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        최근 기록: {""}
                        {new Date(thread.updatedAt).toLocaleDateString("ko-KR")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
          {isViewingOtherThread && (
            <p className="mb-3 rounded-md bg-[#FEF3C7] px-3 py-2 text-xs text-[#92400E]">
              이 대화는 조회 전용입니다. 현재 과목/연도 대화에서만 질문할 수 있어요.
            </p>
          )}
          {/* Welcome block - 처음만 */}
          {displayedMessages.length === 0 && (
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
              <ul className="mb-4 list-inside list-disc space-y-1 text-xs text-[#6B7280]">
                <li>
                  재질문 시 최근 대화 {CHAT_HISTORY_CONTEXT_LIMIT}개만 컨텍스트로 전달됩니다.
                </li>
                <li>
                   챗봇 대화 내용은 30일 동안만 유지되며 이후 자동으로 초기화됩니다.
                </li>
              </ul>
             
            </div>
          )}

          {/* 채팅 메시지 목록 */}
          <div className="mb-4 flex flex-col gap-3">
            {displayedMessages.map((msg, i) => (
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
                  {msg.role === "bot" ? (
                    <div className="[&_code]:rounded [&_code]:bg-[#E5E7EB] [&_code]:px-1 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_td]:border [&_td]:border-[#D1D5DB] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#D1D5DB] [&_th]:bg-[#E5E7EB] [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {/* 로딩 중: loading-chatbot 이미지 */}
            {loading && !isTyping && !isViewingOtherThread && (
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
          {isLoggedIn && displayedMessages.length === 0 && (
            <>
              <p className="text-end mb-2 text-xs text-[#6B7280]">자주 묻는 질문</p>
              <div className="mb-6 flex flex-col items-end gap-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => void handleSend(text)}
                    disabled={!canAsk || isViewingOtherThread}
                    className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#F3F4F6] px-4 py-2.5 text-left text-sm text-[#374151] hover:bg-[#E5E7EB] disabled:opacity-60"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </>
          )}
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
                    void handleSend(input);
                  }
                }}
                placeholder={
                  !isLoggedIn
                    ? "로그인 사용자만 이용 가능합니다."
                    : isViewingOtherThread
                    ? "조회 전용 대화입니다. 현재 과목/연도 대화에서 질문해 주세요."
                    : canAskByLimit
                    ? hasQuestionContext
                      ? "현재 문제를 기준으로 AI 튜터에게 질문해 주세요."
                      : "AI에게 질문해 주세요."
                    : `오늘 질문 한도가 모두 소진되었어요 (${CHATBOT_QUESTION_LIMIT}/${CHATBOT_QUESTION_LIMIT})`
                }
                disabled={
                  !isLoggedIn || !canAskByLimit || isTyping || isViewingOtherThread
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-70"
                aria-label="메시지 입력"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSend(input)}
              disabled={
                !isLoggedIn || !canAskByLimit || loading || isTyping || isViewingOtherThread
              }
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5D50FF] text-white hover:bg-[#4a3ecc] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="보내기"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className={LOGIN_CTA_CLASS}
                style={{ color: LOGIN_CTA_TEXT_COLOR }}
              >
                로그인 하러 가기
              </button>
            ) : hasQuestionContext ? (
              `남은 질문 ${CHATBOT_QUESTION_LIMIT - questionCount}회 · AI는 한정된 데이터에 기반하니 중요한 정보는 추가 확인을 권장해요.`
            ) : canAskByLimit ? (
              `남은 질문 ${CHATBOT_QUESTION_LIMIT - questionCount}회 · AI는 한정된 데이터에 기반하니 중요한 정보는 추가 확인을 권장해요.`
            ) : (
              "AI는 한정된 데이터에 기반하니, 중요한 정보는 추가 확인을 권장해요."
            )}
          </p>
        </div>
      </div>
    </>
  );
}
