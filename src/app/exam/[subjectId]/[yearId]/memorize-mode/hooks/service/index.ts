import { useMutation } from "@tanstack/react-query";

import { getTutorQuestionExplanation } from "../api";

// 암기모드 서비스 훅 - test-mode의 훅 재사용
export { useExamQuestionsWithAnswersQuery } from "@/app/exam/[subjectId]/[yearId]/test-mode/hooks/service";

/** 문제 해설 조회/생성 뮤테이션 */
export const useTutorQuestionExplanationMutation = () => {
  return useMutation({
    mutationFn: (questionId: number) => getTutorQuestionExplanation(questionId),
  });
};
