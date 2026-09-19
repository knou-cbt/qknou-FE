import { NEW_API_URL } from "../urls";

const BOOKMARKS_BASE = `${NEW_API_URL}/api/bookmarks`;

export const BookmarkApiPaths = {
  /** 북마크 목록 조회 */
  list: BOOKMARKS_BASE,

  /** 북마크 등록(POST) / 해제(DELETE) */
  item: (questionId: number | string) => `${BOOKMARKS_BASE}/${questionId}`,
} as const;
