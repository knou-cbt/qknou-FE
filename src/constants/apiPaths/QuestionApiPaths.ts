import { NEW_API_URL } from "../urls";

const QUESTIONS_BASE = `${NEW_API_URL}/api/questions`;

export const QuestionApiPaths = {
  /** 문항 단건 공개 조회 (암기모드 공유) */
  detail: (id: number | string) => `${QUESTIONS_BASE}/${id}`,
} as const;
