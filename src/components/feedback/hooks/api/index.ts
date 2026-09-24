import { FeedbackApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IFeedbackRequest, IFeedbackResponse } from "../../interface";

/**
 * 피드백 제출 (비로그인도 가능). 로그인 상태면 토큰을 함께 보내 사용자와 연결하고,
 * 비로그인이면 토큰 없이 익명으로 제출한다. 단, 서버(API)도 인증 없는 요청을
 * 허용하도록 함께 열려 있어야 실제로 동작한다.
 */
export const postFeedback = (body: IFeedbackRequest) =>
  authorizedFetch<IFeedbackResponse>(FeedbackApiPaths.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    requireAuth: false,
  });
