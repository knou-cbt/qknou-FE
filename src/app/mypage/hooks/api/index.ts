import { UserApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IExamHistory } from "../../interface";

/** 최근 시험 풀이 기록(정오표 포함) 조회. 제출 이력이 없으면 null */
export const getExamHistory = () =>
  authorizedFetch<IExamHistory | null>(UserApiPaths.examHistory);
