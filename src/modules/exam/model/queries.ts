import { useQuery, useMutation } from "@tanstack/react-query";

import { SubjectQueryKeys, ExamQueryKeys } from "@/shared/config";

import {
  getSubjectList,
  getSubjectDetail,
  getExamListBySubject,
} from "../api";
import {
  getExamQuestions,
  getExamQuestionsWithAnswers,
  postExamSubmit,
} from "../api";
import type { IGetSubjectListParams, IExamSubmitRequest } from "../lib";

/** 과목 목록 조회 훅 */
export const useSubjectListQuery = (params?: IGetSubjectListParams) => {
  return useQuery({
    queryKey: SubjectQueryKeys.list(params),
    queryFn: () => getSubjectList(params),
  });
};

/** 과목 상세 조회 훅 */
export const useSubjectDetailQuery = (id: string) => {
  return useQuery({
    queryKey: SubjectQueryKeys.detail(id),
    queryFn: () => getSubjectDetail(id),
    enabled: !!id,
  });
};

/** 특정 과목의 시험지 목록 조회 훅 */
export const useExamListBySubjectQuery = (subjectId: string) => {
  return useQuery({
    queryKey: SubjectQueryKeys.exams(subjectId),
    queryFn: () => getExamListBySubject(subjectId),
    enabled: !!subjectId,
  });
};

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
