import { NEW_API_URL } from "../urls";

const EXAM_SUBMISSIONS_BASE = `${NEW_API_URL}/api/exam-submissions`;

/** 시험지 등록 (P2 — 백엔드 미구현, 화면 골격 전용) */
export const ExamSubmissionApiPaths = {
  create: EXAM_SUBMISSIONS_BASE,
  check: `${EXAM_SUBMISSIONS_BASE}/check`,
} as const;
