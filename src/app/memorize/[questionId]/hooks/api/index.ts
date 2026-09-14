import { QuestionApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { ISharedQuestion } from "../../interface";

/** 문항 단건 공개 조회 (암기모드 공유). 토큰 있으면 자동 첨부되어 isBookmarked가 채워짐 */
export const getQuestion = (questionId: string | number) =>
  authorizedFetch<ISharedQuestion>(QuestionApiPaths.detail(questionId), {
    requireAuth: false,
  });
