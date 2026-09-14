import { useMutation } from "@tanstack/react-query";

import { postFeedback } from "../api";

/** 피드백 제출 뮤테이션 */
export const useFeedbackMutation = () => {
  return useMutation({
    mutationFn: postFeedback,
  });
};
