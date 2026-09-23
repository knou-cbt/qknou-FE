import type { IBookmarkItem } from "./interface";

/** 과목별로 묶는다 — 처음 등장한 순서를 그대로 그룹 순서로 쓴다 */
export function groupBySubject(
  bookmarks: IBookmarkItem[]
): [string, IBookmarkItem[]][] {
  const groups = new Map<string, IBookmarkItem[]>();
  for (const bookmark of bookmarks) {
    const list = groups.get(bookmark.subjectName);
    if (list) {
      list.push(bookmark);
    } else {
      groups.set(bookmark.subjectName, [bookmark]);
    }
  }
  return Array.from(groups.entries());
}

/** 과목별로 묶은 뒤 다시 펼친 목록 — 같은 과목끼리 연속해서 나오도록 정렬한다 */
export function sortBySubjectGroup(bookmarks: IBookmarkItem[]): IBookmarkItem[] {
  return groupBySubject(bookmarks).flatMap(([, items]) => items);
}
