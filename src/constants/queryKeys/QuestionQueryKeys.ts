export const QuestionQueryKeys = {
  all: ["question"] as const,
  detail: (id: number | string) =>
    [...QuestionQueryKeys.all, "detail", id] as const,
} as const;
