/**
 * Subject API 경로
 * API 엔드포인트를 중앙에서 관리합니다.
 */
const SITE_URL = "https://api.qknou.kr";

// 과목 API
const SUBJECTS_BASE = `${SITE_URL}/api/subjects`;

export const SubjectApiPaths = {
  /**
   * 과목 목록 조회 (검색 + 페이지네이션)
   * GET /api/subjects?search=&page=&limit=
   */
  list: SUBJECTS_BASE,

  /**
   * 특정 과목 정보 조회
   * GET /api/subjects/:id
   */
  detail: (id: string | number) => `${SUBJECTS_BASE}/${id}`,

  /**
   * 특정 과목의 시험지 목록 조회
   * GET /api/subjects/:subjectId/exams
   */
  exams: (subjectId: string | number) => `${SUBJECTS_BASE}/${subjectId}/exams`,
} as const;
