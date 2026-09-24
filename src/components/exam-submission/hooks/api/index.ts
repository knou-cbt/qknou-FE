import { ExamSubmissionApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IUploadSubmissionResponse } from "../../interface";

/**
 * 시험지 업로드 (로그인 필요, multipart/form-data). 서버가 (subjectId, year,
 * examType) 조합으로 1차 중복 검증을 함께 처리하므로 별도의 사전 확인 호출은 없다.
 */
export const uploadSubmission = (form: FormData) =>
  authorizedFetch<IUploadSubmissionResponse>(ExamSubmissionApiPaths.create, {
    method: "POST",
    body: form,
  });
