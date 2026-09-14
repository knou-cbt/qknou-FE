export const ExamSubmissionQueryKeys = {
  all: ["exam-submission"] as const,
  check: (subjectId: number, year: number, examType: number) =>
    [...ExamSubmissionQueryKeys.all, "check", subjectId, year, examType] as const,
} as const;
