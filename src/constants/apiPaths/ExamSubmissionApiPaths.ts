import { NEW_API_URL } from "../urls";

const EXAM_SUBMISSIONS_BASE = `${NEW_API_URL}/api/exam-submissions`;

/**
 * 시험지 등록. 업로드 요청 하나로 서버가 (subjectId, year, examType) 조합을
 * 기존 exams 테이블과 1차 중복 검증하고, OCR(Chandra)과 관리자 검수는 접수 후
 * 비동기로 진행된다 — 별도의 사전 중복 확인(check) 엔드포인트는 쓰지 않는다.
 */
export const ExamSubmissionApiPaths = {
  create: EXAM_SUBMISSIONS_BASE,
} as const;
