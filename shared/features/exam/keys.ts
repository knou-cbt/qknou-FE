/**
 * Exam 관련 React Query Keys
 */
  export const ExamQueryKeys = {
    all: ["exam"] as const,
  
    // 시험 문제 조회
    questions: (examId: string | number, mode: "study" | "test") =>
      [...ExamQueryKeys.all, "questions", examId, mode] as const,
  
    // 시험 결과
    results: () => [...ExamQueryKeys.all, "result"] as const,
    result: (examId: string | number) =>
      [...ExamQueryKeys.results(), examId] as const,
  } as const;