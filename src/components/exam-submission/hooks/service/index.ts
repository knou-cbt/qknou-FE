import { useMutation } from "@tanstack/react-query";

import { uploadSubmission } from "../api";

/** 시험지 업로드 뮤테이션 */
export const useUploadSubmissionMutation = () => {
  return useMutation({
    mutationFn: uploadSubmission,
  });
};
