import { useQuery, useMutation } from "@tanstack/react-query";

import { ExamQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";

import {
  getExamQuestions,
  getExamQuestionsWithAnswers,
  postExamSubmit,
} from "../api";
import type { IExamSubmitRequest } from "../../interface";

/** 시험 문제 조회 훅 (시험모드 - 정답 제외) */
export const useExamQuestionsQuery = (examId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ExamQueryKeys.questions(
      examId,
      "test",
      isAuthenticated ? "member" : "guest"
    ),
    queryFn: () => getExamQuestions(examId),
    enabled: !!examId,
    // 로그인 확인 직후 member 키로 바뀌어도 미리보기 화면을 유지한 채 전체 문항을 받는다
    placeholderData: (previous) => previous,
  });
};

/** 시험 문제 조회 훅 (암기모드 - 정답 포함) */
export const useExamQuestionsWithAnswersQuery = (examId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ExamQueryKeys.questions(
      examId,
      "study",
      isAuthenticated ? "member" : "guest"
    ),
    queryFn: () => getExamQuestionsWithAnswers(examId),
    enabled: !!examId,
    placeholderData: (previous) => previous,
  });
};

/** 시험 답안 제출 뮤테이션 */
export const useExamSubmitMutation = (examId: string) => {
  return useMutation({
    mutationFn: (data: IExamSubmitRequest) => postExamSubmit(examId, data),
  });
};
