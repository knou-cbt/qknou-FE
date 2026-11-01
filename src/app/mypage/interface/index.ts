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

/** 사용자가 직접 연결할 수 있는 AI 제공사 */
export type TAiProvider = "openrouter" | "gemini" | "openai" | "anthropic";

/** 연결된 AI 1건. 서버는 원본 키를 돌려주지 않고 마스킹한 값만 내려준다 */
export interface IAiConnection {
  provider: TAiProvider;
  /** 예: "sk-...a1b2" */
  maskedKey: string;
  connectedAt: string;
}

export interface IAiConnectionsResponse {
  /** null이면 큐노 기본 AI 사용 */
  activeProvider: TAiProvider | null;
  connections: IAiConnection[];
}

export { EXAM_TYPE_LABEL } from "@/constants";
