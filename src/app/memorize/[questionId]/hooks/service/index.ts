import { useQuery } from "@tanstack/react-query";

import { QuestionQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";
import { ApiError } from "@/lib/api-client";

import { getQuestion } from "../api";

/** 문항 단건 조회 훅. 무효 토큰(401)이면 로그아웃 처리 후 게스트로 1회 재조회 */
export const useQuestionQuery = (questionId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    // 비로그인은 정답·해설이 null로 와서 로그인 후 다시 받아야 한다
    queryKey: QuestionQueryKeys.detail(
      questionId,
      isAuthenticated ? "member" : "guest"
    ),
    queryFn: () => getQuestion(questionId),
    enabled: !!questionId,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 401 && failureCount < 1,
  });
};
