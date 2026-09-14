import { useQuery } from "@tanstack/react-query";

import { QuestionQueryKeys } from "@/constants";
import { ApiError } from "@/lib/api-client";

import { getQuestion } from "../api";

/** 문항 단건 조회 훅. 무효 토큰(401)이면 로그아웃 처리 후 게스트로 1회 재조회 */
export const useQuestionQuery = (questionId: string) => {
  return useQuery({
    queryKey: QuestionQueryKeys.detail(questionId),
    queryFn: () => getQuestion(questionId),
    enabled: !!questionId,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 401 && failureCount < 1,
  });
};
