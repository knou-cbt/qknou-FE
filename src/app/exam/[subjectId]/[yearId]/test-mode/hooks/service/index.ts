import { useQuery, useMutation } from "@tanstack/react-query";

import { ExamQueryKeys } from "@/constants";

import {
  getExamQuestions,
  getExamQuestionsWithAnswers,
  postExamSubmit,
} from "../api";
import type { IExamSubmitRequest } from "../../interface";

/** 시험 문제 조회 훅 (시험모드 - 정답 제외) */
export const useExamQuestionsQuery = (examId: string) => {
  return useQuery({
    queryKey: ExamQueryKeys.questions(examId, "test"),
    queryFn: () => getExamQuestions(examId),
    enabled: !!examId,
  });
};

/** 시험 문제 조회 훅 (암기모드 - 정답 포함) */
export const useExamQuestionsWithAnswersQuery = (examId: string) => {
  return useQuery({
    queryKey: ExamQueryKeys.questions(examId, "study"),
    queryFn: () => getExamQuestionsWithAnswers(examId),
    enabled: !!examId,
  });
};

/** 시험 답안 제출 뮤테이션 */
export const useExamSubmitMutation = (examId: string) => {
  return useMutation({
    mutationFn: (data: IExamSubmitRequest) => postExamSubmit(examId, data),
  });
};
