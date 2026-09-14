import { ExamApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type {
  IExamQuestionsResponse,
  IExamQuestionsWithAnswersResponse,
  IExamSubmitRequest,
  IExamSubmitResponse,
} from "../../interface";

/** API 응답 공통 형식 */
interface IApiResponse<T> {
  success: boolean;
  data: T;
}

/** 시험 문제 조회 (시험모드 - 정답 제외) */
export const getExamQuestions = async (
  examId: string
): Promise<IExamQuestionsResponse> => {
  const response = await fetch(ExamApiPaths.questions(examId, "test"));
  if (!response.ok) throw new Error("시험 문제 조회 실패");

  const result: IApiResponse<IExamQuestionsResponse> = await response.json();
  return result.data;
};

/** API에서 반환하는 원본 문제 타입 */
interface IApiQuestionWithAnswer {
  id: number;
  number: number;
  text: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  example?: string | null;
  sharedExample?: string | null;
  sharedExampleImageUrls?: string[] | null;
  choices: { id: number; number: number; text: string }[];
  correctAnswers?: number[]; // 복수 정답 지원
  explanation?: string;
}

interface IApiExamQuestionsWithAnswersResponse {
  exam: {
    id: number;
    subject: string;
    title: string;
    totalQuestions: number;
    year: number;
  };
  questions: IApiQuestionWithAnswer[];
}

/** 시험 문제 조회 (암기모드 - 정답 포함) */
export const getExamQuestionsWithAnswers = async (
  examId: string
): Promise<IExamQuestionsWithAnswersResponse> => {
  const response = await fetch(ExamApiPaths.questions(examId, "study"));
  if (!response.ok) throw new Error("시험 문제 조회 실패");

  const result: IApiResponse<IApiExamQuestionsWithAnswersResponse> =
    await response.json();

  return {
    ...result.data,
    questions: result.data.questions.map((q) => ({
      ...q,
      correctAnswers: q.correctAnswers ?? [],
    })),
  };
};

/** API에서 반환하는 원본 결과 타입 */
interface IApiQuestionResult {
  questionId: number;
  selectedAnswer: number | null;
  correctAnswers?: number[]; // 복수 정답 지원
  isCorrect: boolean;
}

interface IApiExamSubmitResponse {
  examId: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  results: IApiQuestionResult[];
}

/**
 * 시험 답안 제출 및 채점
 * 로그인(인증 헤더) 상태로 제출하면 백엔드가 최근 풀이 기록으로 저장한다.
 * 비로그인 시에는 헤더 없이 지금과 동일하게 채점만 수행된다.
 */
export const postExamSubmit = async (
  examId: string,
  data: IExamSubmitRequest
): Promise<IExamSubmitResponse> => {
  const result = await authorizedFetch<IApiExamSubmitResponse>(
    ExamApiPaths.submit(examId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      requireAuth: false,
    }
  );

  return {
    ...result,
    results: result.results.map((r) => ({
      ...r,
      correctAnswers: r.correctAnswers ?? [],
    })),
  };
};
