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

export interface IExamHistoryDetail extends IExamHistoryItem {
  answers: IExamHistoryAnswer[];
}

export { EXAM_TYPE_LABEL } from "@/constants";
