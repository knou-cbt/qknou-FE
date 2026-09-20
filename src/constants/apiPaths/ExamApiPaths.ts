/**
 * API 경로
 * API 엔드포인트를 중앙에서 관리합니다.
 */

import { API_URL, NEW_API_URL } from '../urls';

const SERVER_URL = API_URL;

// 과목 API
const SUBJECTS_BASE = `${SERVER_URL}/api/subjects`;

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

// 시험지/문제 API
const EXAMS_BASE = `${SERVER_URL}/api/exams`;

export const ExamApiPaths = {
  /**
   * 시험 문제 조회 (암기모드/시험모드)
   * GET /api/exams/:id/questions?mode=study (문제 + 정답 포함)
   * GET /api/exams/:id/questions?mode=test (문제만, 정답 제외)
   */
  questions: (examId: string | number, mode: "study" | "test") =>
    `${EXAMS_BASE}/${examId}/questions?mode=${mode}`,

  /**
   * 시험 답안 제출 및 채점
   * POST /api/exams/:id/submit
   *
   * 로그인 상태로 제출하면 마이페이지 풀이내역(신규 API)에도 저장되므로,
   * 풀이내역 조회(UserApiPaths.examHistory)와 같은 백엔드를 타도록 신규 API 베이스를 쓴다.
   */
  submit: (examId: string | number) => `${NEW_API_URL}/api/exams/${examId}/submit`,
} as const;

// AI 튜터 API
const TUTOR_BASE = `${SERVER_URL}/api/tutor`;

export const TutorApiPaths = {
  chat: `${TUTOR_BASE}/chat`,
  remainingCount: `${TUTOR_BASE}/remaining-count`,
  explanation: (questionId: string | number) =>
    `${TUTOR_BASE}/questions/${questionId}/explanation`,
} as const;
