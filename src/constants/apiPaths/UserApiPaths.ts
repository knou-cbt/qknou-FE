import { API_URL } from "../urls";

export const UserApiPaths = {
  /** 최근 시험 풀이 기록(정오표 포함) 조회 */
  examHistory: `${API_URL}/api/users/me/exam-history`,
} as const;
