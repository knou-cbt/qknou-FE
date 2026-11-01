import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UserQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";

import type { TAiProvider } from "../../interface";
import {
  deleteAiConnection,
  getAiConnections,
  getAllExamHistory,
  getExamHistory,
  getExamHistoryDetail,
  saveAiConnection,
  updateActiveAiProvider,
} from "../api";

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

/** 풀이 기록 전체 조회 훅 — 과목별 필터링처럼 클라이언트에서 전체 목록이 필요할 때 사용 */
export const useAllExamHistoryQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...UserQueryKeys.examHistory(), "all"],
    queryFn: getAllExamHistory,
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

/** 내 AI 연결 목록 조회 훅 */
export const useAiConnectionsQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: UserQueryKeys.aiConnections(),
    queryFn: getAiConnections,
    enabled: isAuthenticated,
  });
};

const useInvalidateAiConnections = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: UserQueryKeys.aiConnections() });
};

/** API 키 저장(연결) 뮤테이션 */
export const useSaveAiConnectionMutation = () => {
  const invalidate = useInvalidateAiConnections();
  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: TAiProvider; apiKey: string }) =>
      saveAiConnection(provider, apiKey),
    onSettled: invalidate,
  });
};

/** 연결 해제 뮤테이션 */
export const useDeleteAiConnectionMutation = () => {
  const invalidate = useInvalidateAiConnections();
  return useMutation({
    mutationFn: (provider: TAiProvider) => deleteAiConnection(provider),
    onSettled: invalidate,
  });
};

/** 사용할 AI 선택 뮤테이션 */
export const useUpdateActiveAiProviderMutation = () => {
  const invalidate = useInvalidateAiConnections();
  return useMutation({
    mutationFn: (provider: TAiProvider | null) => updateActiveAiProvider(provider),
    onSettled: invalidate,
  });
};
