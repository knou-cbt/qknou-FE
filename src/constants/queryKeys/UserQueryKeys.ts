export const UserQueryKeys = {
  all: ["user"] as const,
  examHistory: () => [...UserQueryKeys.all, "exam-history"] as const,
} as const;
