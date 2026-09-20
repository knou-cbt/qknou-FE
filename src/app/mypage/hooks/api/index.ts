import { UserApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IExamHistoryListResponse } from "../../interface";

/** 목록을 한 번에 받아 프론트에서 페이지네이션한다 (북마크 목록과 동일한 방식) */
const EXAM_HISTORY_FETCH_LIMIT = 1000;

/** 시험 풀이 기록 목록 조회 */
export const getExamHistory = () =>
  authorizedFetch<IExamHistoryListResponse>(
    `${UserApiPaths.examHistory}?limit=${EXAM_HISTORY_FETCH_LIMIT}`
  );
