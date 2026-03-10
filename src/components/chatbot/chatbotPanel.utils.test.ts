import {
  buildThreadId,
  formatThreadTitle,
  getLocalDateKey,
  getMsUntilNextLocalMidnight,
  type ChatThread,
} from "./chatbotPanel.utils";

describe("chatbotPanel.utils", () => {
  it("formats a local date key as YYYY-MM-DD", () => {
    const date = new Date(2026, 2, 10, 15, 20, 30);

    expect(getLocalDateKey(date)).toBe("2026-03-10");
  });

  it("calculates milliseconds until the next local midnight", () => {
    const now = new Date(2026, 2, 10, 23, 59, 30, 0);

    expect(getMsUntilNextLocalMidnight(now)).toBe(30 * 1000);
  });

  it("builds a scoped thread id when subject and year exist", () => {
    expect(buildThreadId("edu", "2025")).toBe("edu:2025");
  });

  it("falls back to the general thread id when context is incomplete", () => {
    expect(buildThreadId("edu")).toBe("general");
    expect(buildThreadId(undefined, "2025")).toBe("general");
  });

  it("formats thread titles using labels first", () => {
    const thread: ChatThread = {
      threadId: "edu:2025",
      subjectId: "edu",
      yearId: "2025",
      subjectLabel: "교육학",
      yearLabel: "2025학년도",
      messages: [],
      updatedAt: Date.now(),
    };

    expect(formatThreadTitle(thread)).toBe("교육학 · 2025학년도");
  });

  it("falls back to ids and default labels when labels are missing", () => {
    expect(
      formatThreadTitle({
        threadId: "general",
        messages: [],
        updatedAt: Date.now(),
      })
    ).toBe("일반 · -");
  });
});

