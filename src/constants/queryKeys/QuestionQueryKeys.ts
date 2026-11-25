export const QuestionQueryKeys = {
  all: ["question"] as const,
  // 비로그인은 정답·해설이 null이라 로그인과 캐시를 나눈다
  detail: (id: number | string, audience: "guest" | "member" = "guest") =>
    [...QuestionQueryKeys.all, "detail", id, audience] as const,
} as const;
