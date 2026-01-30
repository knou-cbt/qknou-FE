// Exam domain 타입 정의
  
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
  
  
  // ============================================
  // API 원본 응답 타입 (api.ts에서 사용)
  // ============================================

  /** API에서 반환하는 원본 문제 타입 */
  export interface IApiQuestionWithAnswer {
    id: number;
    number: number;
    text: string;
    imageUrl?: string | null;
    choices: { id: number; number: number; text: string }[];
    correctAnswers?: number[]; // 복수 정답 지원
    explanation?: string;
  }

  /** API에서 반환하는 원본 시험 문제 조회 응답 (암기모드) */
  export interface IApiExamQuestionsWithAnswersResponse {
    exam: {
      id: number;
      subject: string;
      title: string;
      totalQuestions: number;
      year: number;
    };
    questions: IApiQuestionWithAnswer[];
  }

  /** API에서 반환하는 원본 문제 결과 타입 */
  export interface IApiQuestionResult {
    questionId: number;
    selectedAnswer: number | null;
    correctAnswers?: number[]; // 복수 정답 지원
    isCorrect: boolean;
  }

  /** API에서 반환하는 원본 시험 제출 응답 타입 */
  export interface IApiExamSubmitResponse {
    examId: string;
    totalQuestions: number;
    correctCount: number;
    score: number;
    results: IApiQuestionResult[];
  }
  