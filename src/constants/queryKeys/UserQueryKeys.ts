export const UserQueryKeys = {
  all: ["user"] as const,
  examHistory: () => [...UserQueryKeys.all, "exam-history"] as const,
  examHistoryDetail: (attemptId: number) =>
    [...UserQueryKeys.examHistory(), "detail", attemptId] as const,
} as const;
