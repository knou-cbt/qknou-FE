// 암기모드 관련 API 경로 및 상수 정의

export const MemorizeApiPath = {
    GET_QUESTIONS: "/api/exam/questions",
} as const

export type TMemorizeApiPath = typeof MemorizeApiPath[keyof typeof MemorizeApiPath]

