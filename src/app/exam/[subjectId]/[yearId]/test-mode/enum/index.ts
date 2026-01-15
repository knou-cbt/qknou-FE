// 시험모드 관련 API 경로 및 상수 정의

export const TestApiPath = {
    GET_QUESTIONS: "/api/exam/questions",
    SUBMIT_ANSWERS: "/api/exam/submit",
} as const

export type TTestApiPath = typeof TestApiPath[keyof typeof TestApiPath]

