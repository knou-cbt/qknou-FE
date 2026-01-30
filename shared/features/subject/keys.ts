/**
 * Subject 관련 React Query Keys
 */
export const SubjectQueryKeys = {
  all: ["subject"] as const,

  // 과목 목록
  lists: () => [...SubjectQueryKeys.all, "list"] as const,
  list: (filters?: { search?: string; page?: number; limit?: number }) =>
    [...SubjectQueryKeys.lists(), filters] as const,

  // 과목 상세
  details: () => [...SubjectQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...SubjectQueryKeys.details(), id] as const,

  // 특정 과목의 시험지 목록
  exams: (subjectId: string | number) =>
    [...SubjectQueryKeys.detail(subjectId), "exams"] as const,
} as const;
