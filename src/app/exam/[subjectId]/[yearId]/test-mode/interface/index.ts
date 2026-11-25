// 시험모드 관련 인터페이스 정의

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
  imageUrls?: string[] | null;
}

/** 문제 정보 (시험모드 - 정답 제외) */
export interface IQuestion {
  id: number;
  number: number;
  text: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  example?: string | null;
  /** 공통 보기 텍스트 */
  sharedExample?: string | null;
  /** 공통 보기 이미지 */
  sharedExampleImageUrls?: string[] | null;
  choices: IChoice[];
}

/** 문제 정보 (암기모드 - 정답 포함) */
export interface IQuestionWithAnswer extends IQuestion {
  correctAnswers: number[]; // 복수 정답 지원 (배열)
  explanation?: string;
}

/** 비로그인 미리보기 정보. 비로그인 응답에만 있고, 앞 limit 문항만 내려온다 */
export interface IQuestionsPreview {
  limit: number;
  totalQuestions: number;
}

/** 시험 문제 조회 응답 (시험모드) */
export interface IExamQuestionsResponse {
  exam: IExamInfo;
  questions: IQuestion[];
  preview?: IQuestionsPreview;
}

/** 시험 문제 조회 응답 (암기모드 - 로그인 시 정답을 따로 받아 합친 결과, 비로그인은 correctAnswers가 빈 배열) */
export interface IExamQuestionsWithAnswersResponse {
  exam: IExamInfo;
  questions: IQuestionWithAnswer[];
  preview?: IQuestionsPreview;
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
