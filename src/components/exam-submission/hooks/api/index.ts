import { ExamSubmissionApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type {
  ICheckDuplicateParams,
  ICheckDuplicateResponse,
  IUploadSubmissionResponse,
} from "../../interface";

interface IApiResponse<T> {
  success: boolean;
  data: T;
}

/** 시험지 등록 사전 중복 확인 (비인증) */
export const checkDuplicate = async (
  params: ICheckDuplicateParams
): Promise<ICheckDuplicateResponse> => {
  const query = new URLSearchParams({
    subjectId: String(params.subjectId),
    year: String(params.year),
    examType: String(params.examType),
  });
  const response = await fetch(`${ExamSubmissionApiPaths.check}?${query}`);
  if (!response.ok) throw new Error("중복 확인 실패");

  const result: IApiResponse<ICheckDuplicateResponse> = await response.json();
  return result.data;
};

/** 시험지 업로드 (로그인 필요, multipart/form-data) */
export const uploadSubmission = (form: FormData) =>
  authorizedFetch<IUploadSubmissionResponse>(ExamSubmissionApiPaths.create, {
    method: "POST",
    body: form,
  });
