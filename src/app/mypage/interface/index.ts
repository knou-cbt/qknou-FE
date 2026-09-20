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

export { EXAM_TYPE_LABEL } from "@/constants";
