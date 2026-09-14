import { FeedbackApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IFeedbackRequest, IFeedbackResponse } from "../../interface";

/** 피드백 제출 (로그인 필요) */
export const postFeedback = (body: IFeedbackRequest) =>
  authorizedFetch<IFeedbackResponse>(FeedbackApiPaths.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
