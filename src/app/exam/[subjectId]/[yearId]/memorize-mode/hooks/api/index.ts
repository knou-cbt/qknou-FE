import { API_URL } from "@/constants";

// 암기모드 API - test-mode의 API 재사용
export { getExamQuestionsWithAnswers } from "@/app/exam/[subjectId]/[yearId]/test-mode/hooks/api";

export interface ITutorQuestionExplanationResponse {
  success: boolean;
  explanation: string;
  conceptTags?: string[] | null;
  generated: boolean;
}

/** 문제 해설 조회/생성 */
export const getTutorQuestionExplanation = async (
  questionId: number
): Promise<ITutorQuestionExplanationResponse> => {
  const response = await fetch(
    `${API_URL}/api/tutor/questions/${questionId}/explanation`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error("문제 해설 조회 실패");

  const result: ITutorQuestionExplanationResponse = await response.json();
  if (!result.success) throw new Error("문제 해설 생성 실패");

  return result;
};
