export const NoticeQueryKeys = {
  all: ["notice"] as const,
  active: () => [...NoticeQueryKeys.all, "active"] as const,
} as const;
