import { ExamApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-token";

import type {
  IQuestionsPreview,
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

/**
 * 문항 목록 요청. 로그인 토큰이 있으면 붙여서 전체 문항을 받는다.
 * 서버 렌더링(SSR)에는 토큰이 없어 비로그인 미리보기만 받는다.
 */
const fetchQuestions = (
  examId: string,
  mode: "study" | "test",
  init?: RequestInit
) => {
  const token = getAuthToken();
  return fetch(ExamApiPaths.questions(examId, mode), {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
};

/** 시험 문제 조회 (시험모드 - 정답 제외) */
export const getExamQuestions = async (
  examId: string
): Promise<IExamQuestionsResponse> => {
  const response = await fetchQuestions(examId, "test");
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
  preview?: IQuestionsPreview;
}

/** GET /api/exams/:id/answers 응답 */
interface IApiExamAnswersResponse {
  examId: number;
  answers: { questionId: number; number: number; correctAnswers: number[] }[];
}

/** 시험 정답 조회 (로그인 필요) */
export const getExamAnswers = (examId: string) =>
  authorizedFetch<IApiExamAnswersResponse>(ExamApiPaths.answers(examId));

/**
 * 시험 문제 조회 (암기모드)
 * 문항 목록에는 정답이 없어서, 로그인 상태면 정답을 따로 받아 합친다.
 * 비로그인(SSR 포함)은 미리보기 문항만 오고 correctAnswers는 빈 배열이다.
 */
export const getExamQuestionsWithAnswers = async (
  examId: string,
  init?: RequestInit
): Promise<IExamQuestionsWithAnswersResponse> => {
  const isLoggedIn = Boolean(getAuthToken());
  const [response, answers] = await Promise.all([
    fetchQuestions(examId, "study", init),
    isLoggedIn ? getExamAnswers(examId) : Promise.resolve(null),
  ]);
  if (!response.ok) throw new Error("시험 문제 조회 실패");

  const result: IApiResponse<IApiExamQuestionsWithAnswersResponse> =
    await response.json();

  const answerMap = new Map(
    (answers?.answers ?? []).map((a) => [a.questionId, a.correctAnswers])
  );

  return {
    ...result.data,
    questions: result.data.questions.map((q) => ({
      ...q,
      correctAnswers: answerMap.get(q.id) ?? q.correctAnswers ?? [],
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
