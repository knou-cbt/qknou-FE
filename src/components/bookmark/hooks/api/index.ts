import { BookmarkApiPaths } from "@/constants";
import { authorizedFetch } from "@/lib/api-client";

import type { IBookmarkItem } from "../../interface";

/** 북마크 목록 조회 */
export const getBookmarks = () =>
  authorizedFetch<IBookmarkItem[]>(BookmarkApiPaths.list);

/** 북마크 등록 (idempotent) */
export const addBookmark = (questionId: number) =>
  authorizedFetch<void>(BookmarkApiPaths.item(questionId), {
    method: "POST",
  });

/** 북마크 해제 (idempotent) */
export const removeBookmark = (questionId: number) =>
  authorizedFetch<void>(BookmarkApiPaths.item(questionId), {
    method: "DELETE",
  });
