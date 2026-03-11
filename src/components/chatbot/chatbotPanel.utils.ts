export const CHATBOT_QUESTION_LIMIT = 5;
export const CHAT_HISTORY_CONTEXT_LIMIT = 2;
export const STORAGE_KEY_PREFIX = "qknou_chatbot_questions_";
export const CHAT_HISTORY_KEY_PREFIX = "qknou_chatbot_history_";
export const CHAT_HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type ChatMessage = { role: "user" | "bot"; text: string };

export type ChatThread = {
  threadId: string;
  subjectId?: string;
  yearId?: string;
  subjectLabel?: string;
  yearLabel?: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export type StoredChatHistory = {
  version: 2;
  threads: ChatThread[];
};

export type StoredDailyQuestionCount = {
  count: number;
  dateKey: string;
};

export function getQuestionCountKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMsUntilNextLocalMidnight(now = new Date()) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export function getChatHistoryKey(userId: string) {
  return `${CHAT_HISTORY_KEY_PREFIX}${userId}`;
}

export function buildThreadId(subjectId?: string, yearId?: string) {
  if (subjectId && yearId) return `${subjectId}:${yearId}`;
  return "general";
}

export function formatThreadTitle(thread: ChatThread) {
  const subject = thread.subjectLabel ?? thread.subjectId ?? "일반";
  const year = thread.yearLabel ?? thread.yearId ?? "-";
  return `${subject} · ${year}`;
}

