import { API_URL } from "../urls";

export const NoticeApiPaths = {
  /** 활성 공지 조회 */
  active: `${API_URL}/api/notices/active`,
} as const;
