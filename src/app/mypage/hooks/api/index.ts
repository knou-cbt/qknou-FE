import { UserApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type {
  IAiConnection,
  IAiConnectionsResponse,
  IExamHistoryDetail,
  IExamHistoryItem,
  IExamHistoryListResponse,
  TAiProvider,
} from "../../interface";

/** 시험 풀이 기록 목록 조회 (limit은 서버 제한상 최대 50) */
export const getExamHistory = (page: number, limit: number) =>
  authorizedFetch<IExamHistoryListResponse>(
    `${UserApiPaths.examHistory}?page=${page}&limit=${limit}`
  );

/**
 * 풀이 기록 전체 조회. 과목별 필터링을 프론트에서 처리하기 위해 페이지네이션 API를
 * 최대 페이지 크기(50)로 필요한 만큼 순차 호출해 모두 모은다.
 */
export const getAllExamHistory = async (): Promise<IExamHistoryItem[]> => {
  const limit = 50;
  const first = await getExamHistory(1, limit);
  if (first.items.length >= first.total) return first.items;

  const totalPages = Math.ceil(first.total / limit);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => getExamHistory(i + 2, limit))
  );

  return [...first.items, ...rest.flatMap((page) => page.items)];
};

/** 풀이 기록 단건 상세(문항별 정오표 포함) 조회 */
export const getExamHistoryDetail = (attemptId: number) =>
  authorizedFetch<IExamHistoryDetail>(UserApiPaths.examHistoryDetail(attemptId));

/** 내 AI 연결 목록 + 현재 사용 중인 AI 조회 */
export const getAiConnections = () =>
  authorizedFetch<IAiConnectionsResponse>(UserApiPaths.aiConnections);

/** 제공사 API 키 저장. 서버가 제공사에 키를 검증해보고 유효하지 않으면 400을 돌려준다 */
export const saveAiConnection = (provider: TAiProvider, apiKey: string) =>
  authorizedFetch<IAiConnection>(UserApiPaths.aiConnection(provider), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

/** 제공사 연결 해제(서버에 저장된 키 삭제). 사용 중이던 AI면 서버가 기본 AI로 되돌린다 */
export const deleteAiConnection = (provider: TAiProvider) =>
  authorizedFetch<void>(UserApiPaths.aiConnection(provider), {
    method: "DELETE",
  });

/** 챗봇이 사용할 AI 선택. null이면 큐노 기본 AI */
export const updateActiveAiProvider = (activeProvider: TAiProvider | null) =>
  authorizedFetch<IAiConnectionsResponse>(UserApiPaths.aiConnections, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activeProvider }),
  });
