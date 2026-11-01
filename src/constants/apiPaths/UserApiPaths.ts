import { NEW_API_URL } from "../urls";

export const UserApiPaths = {
  /** 시험 풀이 기록 목록 조회 */
  examHistory: `${NEW_API_URL}/api/users/me/exam-history`,
  /** 풀이 기록 단건 상세(문항별 정오표 포함) 조회. attemptId는 목록 응답의 items[].id */
  examHistoryDetail: (attemptId: number | string) =>
    `${NEW_API_URL}/api/users/me/exam-history/${attemptId}`,
  /** 내 AI(LLM) 연결 목록 조회(GET) / 사용할 AI 선택(PATCH) */
  aiConnections: `${NEW_API_URL}/api/users/me/ai-connections`,
  /** 제공사별 API 키 저장(PUT) / 연결 해제(DELETE) */
  aiConnection: (provider: string) =>
    `${NEW_API_URL}/api/users/me/ai-connections/${provider}`,
} as const;
