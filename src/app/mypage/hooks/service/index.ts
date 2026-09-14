import { useQuery } from "@tanstack/react-query";

import { UserQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";

import { getExamHistory } from "../api";

/** 최근 시험 풀이 기록 조회 훅 */
export const useExamHistoryQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: UserQueryKeys.examHistory(),
    queryFn: getExamHistory,
    enabled: isAuthenticated,
  });
};
