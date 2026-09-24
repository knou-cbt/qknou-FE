export interface IExamHistoryItem {
  id: number;
  examId: number;
  examTitle: string;
  examType: number;
  subjectName: string;
  year: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  submittedAt: string;
}

export interface IExamHistoryListResponse {
  items: IExamHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IExamHistoryAnswer {
  questionId: number;
  questionNumber: number;
  questionText: string;
  /** 미선택 시 null */
  userAnswer: number | null;
  /** 복수 정답 지원 */
  correctAnswers: number[];
  isCorrect: boolean;
}

/**
 * 목록(IExamHistoryItem)과 달리 subject/year/examType이 exam 객체로 중첩돼 온다.
 * 실제 응답 예시: { id, exam: { id, title, subject, year, examType }, totalQuestions, ... }
 */
export interface IExamHistoryDetail {
  id: number;
  exam: {
    id: number;
    title: string;
    subject: string;
    year: number;
    examType: number;
  };
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  submittedAt: string;
  answers: IExamHistoryAnswer[];
}

export { EXAM_TYPE_LABEL } from "@/constants";
