export type TCheckBlockedReason = "already_published" | "already_in_review";

export interface ICheckDuplicateParams {
  subjectId: number;
  year: number;
  examType: number;
}

export interface ICheckDuplicateResponse {
  blocked: boolean;
  reason?: TCheckBlockedReason;
}

export interface IUploadSubmissionResponse {
  id: number;
  status: string;
  createdAt: string;
}
