//API 호출 함수
import { ExamApiPaths } from "./path";
import {
  IExamQuestionsResponse,
  IExamQuestionsWithAnswersResponse,
  IExamSubmitRequest,
  IExamSubmitResponse,
  IApiQuestionWithAnswer,
  IApiExamQuestionsWithAnswersResponse,
  IApiQuestionResult,
  IApiExamSubmitResponse,
} from "./interface";
import { IApiResponse } from "../common/types";

/** 시험 문제 조회 (시험모드 - 정답 제외) */
export const getExamQuestions = async (
  examId: string
): Promise<IExamQuestionsResponse> => {
  const response = await fetch(ExamApiPaths.questions(examId, "test"));
  if (!response.ok) throw new Error("시험 문제 조회 실패");

  const result: IApiResponse<IExamQuestionsResponse> = await response.json();
  return result.data;
};

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

/** 시험 답안 제출 및 채점 */
export const postExamSubmit = async (
  examId: string,
  data: IExamSubmitRequest
): Promise<IExamSubmitResponse> => {
  const response = await fetch(ExamApiPaths.submit(examId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("시험 제출 실패");

  const result: IApiResponse<IApiExamSubmitResponse> = await response.json();

  return {
    ...result.data,
    results: result.data.results.map((r) => ({
      ...r,
      correctAnswers: r.correctAnswers ?? [],
    })),
  };
};
