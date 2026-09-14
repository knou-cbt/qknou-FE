import { NoticeApiPaths } from "@/constants";

import type { INotice } from "../../interface";

interface IApiResponse<T> {
  success: boolean;
  data: T;
}

/** 활성 공지 조회 (비인증) */
export const getActiveNotices = async (): Promise<INotice[]> => {
  const response = await fetch(NoticeApiPaths.active);
  if (!response.ok) throw new Error("공지 조회 실패");

  const result: IApiResponse<INotice[]> = await response.json();
  return result.data;
};
