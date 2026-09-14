export type TFeedbackType =
  | "question_bug"
  | "site_bug"
  | "suggestion"
  | "other";

export interface IFeedbackRequest {
  type: TFeedbackType;
  content: string;
  questionId?: number;
  pageUrl?: string;
}

export interface IFeedbackResponse {
  id: number;
  type: string;
  githubIssueUrl: string | null;
  integrationStatus: "created" | "merged" | "failed";
  createdAt: string;
}
