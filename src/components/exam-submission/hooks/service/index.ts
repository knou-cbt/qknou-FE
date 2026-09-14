import { useMutation, useQuery } from "@tanstack/react-query";

import { ExamSubmissionQueryKeys } from "@/constants";

import { checkDuplicate, uploadSubmission } from "../api";
import type { ICheckDuplicateParams } from "../../interface";

/** 과목/연도/시험종류가 모두 선택됐을 때만 중복 확인 */
export const useCheckDuplicateQuery = (params: ICheckDuplicateParams | null) => {
  return useQuery({
    queryKey: params
      ? ExamSubmissionQueryKeys.check(params.subjectId, params.year, params.examType)
      : ExamSubmissionQueryKeys.all,
    queryFn: () => checkDuplicate(params as ICheckDuplicateParams),
    enabled: !!params,
    staleTime: 0,
  });
};

/** 시험지 업로드 뮤테이션 */
export const useUploadSubmissionMutation = () => {
  return useMutation({
    mutationFn: uploadSubmission,
  });
};
