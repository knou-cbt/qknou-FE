import { useQuery } from "@tanstack/react-query";

import { SubjectQueryKeys } from "@/constants";

import {
  getSubjectList,
  getSubjectDetail,
  getExamListBySubject,
  type IGetSubjectListParams,
} from "../api";

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
