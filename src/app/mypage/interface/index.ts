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

export interface IExamHistory {
  exam: {
    id: number;
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
