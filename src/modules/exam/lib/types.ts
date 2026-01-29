// Exam domain 타입 정의

/** 과목 정보 */
export interface ISubject {
  id: number;
  name: string;
  examCount?: number;
  createdAt?: string;
}

/** 시험지 정보 */
export interface IExam {
  id: string;
  year: number;
  title?: string;
  subjectId: string;
  subjectName?: string;
}

/** @deprecated IExam으로 대체 */
export interface IExamYear {
  id: string;
  year: number;
  subjectId: string;
}

/** 시험 정보 */
export interface IExamInfo {
  id: number;
  subject: string;
  title: string;
  totalQuestions: number;
  year: number;
}

/** 답안 선택지 */
export interface IChoice {
  id: number;
  number: number;
  text: string;
}

/** 문제 정보 (시험모드 - 정답 제외) */
export interface IQuestion {
  id: number;
  number: number;
  text: string;
  imageUrl?: string | null;
  example?: string | null;
  choices: IChoice[];
}

/** 문제 정보 (암기모드 - 정답 포함) */
export interface IQuestionWithAnswer extends IQuestion {
  correctAnswers: number[]; // 복수 정답 지원 (배열)
  explanation?: string;
}

/** 시험 문제 조회 응답 (시험모드) */
export interface IExamQuestionsResponse {
  exam: IExamInfo;
  questions: IQuestion[];
}

/** 시험 문제 조회 응답 (암기모드 - 정답 포함) */
export interface IExamQuestionsWithAnswersResponse {
  exam: IExamInfo;
  questions: IQuestionWithAnswer[];
}

/** 문제 결과 */
export interface IQuestionResult {
  questionId: number;
  selectedAnswer: number | null;
  correctAnswers: number[]; // 복수 정답 지원 (배열)
  isCorrect: boolean;
}

/** 시험 제출 요청 */
export interface IExamSubmitRequest {
  answers: { questionId: number; selectedAnswer: number | null }[];
}

/** 시험 제출 응답 (채점 결과) */
export interface IExamSubmitResponse {
  examId: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  results: IQuestionResult[];
}

/** 과목 목록 조회 파라미터 */
export interface IGetSubjectListParams {
  search?: string;
  page?: number;
  limit?: number;
}

/** 페이지네이션 정보 */
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 과목 목록 조회 응답 */
export interface IGetSubjectListResponse {
  pagination: IPagination;
  subjects: ISubject[];
}
