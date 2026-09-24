export interface IBookmarkItem {
  questionId: number;
  questionNumber: number;
  questionText: string;
  examId: number;
  examTitle: string;
  subjectName: string;
  bookmarkedAt: string;
  /** 내부 파일명(examTitle) 대신 표시할 값 — 백엔드 미지원 시 examTitle로 대체 */
  year?: number;
  examType?: number;
}
