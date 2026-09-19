import { NEW_API_URL } from "../urls";

export const FeedbackApiPaths = {
  /** 피드백 제출 */
  create: `${NEW_API_URL}/api/feedbacks`,
} as const;
