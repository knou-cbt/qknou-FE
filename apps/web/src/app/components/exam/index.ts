// UI Components
export * from "./ExamYearPage";
export * from "./TestModePage";
export * from "./MemorizeModePage";

// Context
export * from "./ExamContext";

// Queries and types from @qknou/shared
export {
  useExamQuestionsQuery,
  useExamQuestionsWithAnswersQuery,
  useExamSubmitMutation,
  useSubjectListQuery,
  useSubjectDetailQuery,
  useExamListBySubjectQuery,
} from "@qknou/shared";

export type {
  IQuestionResult,
  IExamQuestionsResponse,
  IExamQuestionsWithAnswersResponse,
  IExamSubmitRequest,
  IExamSubmitResponse,
  IExam,
  ISubject,
  IGetSubjectListParams,
  IGetSubjectListResponse,
} from "@qknou/shared";
