import { useQuery } from "@tanstack/react-query";

import { UserQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";

import { getExamHistory, getExamHistoryDetail } from "../api";

/** 시험 풀이 기록 목록 조회 훅 (1-base page, limit 최대 50) */
export const useExamHistoryQuery = (page: number, limit: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...UserQueryKeys.examHistory(), page, limit],
    queryFn: () => getExamHistory(page, limit),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
};

/** 풀이 기록 단건 상세(정오표) 조회 훅 — attemptId가 없으면 비활성화 */
export const useExamHistoryDetailQuery = (attemptId: number | null) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: UserQueryKeys.examHistoryDetail(attemptId ?? -1),
    queryFn: () => getExamHistoryDetail(attemptId as number),
    enabled: isAuthenticated && attemptId !== null,
  });
};
