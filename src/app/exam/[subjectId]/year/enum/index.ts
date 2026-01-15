// Exam Year 관련 API 경로 및 상수 정의

export const ExamYearApiPath = {
    GET_EXAM_YEARS: "/api/exam/years",
} as const

export type TExamYearApiPath = typeof ExamYearApiPath[keyof typeof ExamYearApiPath]

