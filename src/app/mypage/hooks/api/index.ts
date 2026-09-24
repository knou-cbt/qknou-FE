import { UserApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IExamHistoryDetail, IExamHistoryListResponse } from "../../interface";

/** 시험 풀이 기록 목록 조회 (limit은 서버 제한상 최대 50) */
export const getExamHistory = (page: number, limit: number) =>
  authorizedFetch<IExamHistoryListResponse>(
    `${UserApiPaths.examHistory}?page=${page}&limit=${limit}`
  );

/** 풀이 기록 단건 상세(문항별 정오표 포함) 조회 */
export const getExamHistoryDetail = (attemptId: number) =>
  authorizedFetch<IExamHistoryDetail>(UserApiPaths.examHistoryDetail(attemptId));
