import type { IChoice } from "@/app/exam/[subjectId]/[yearId]/test-mode/interface";

export type { IChoice };

export interface ISharedQuestion {
  id: number;
  questionNumber: number;
  text: string;
  example?: string | null;
  sharedExample?: string | null;
  imageUrls?: string[] | null;
  choices: IChoice[];
  /** 비로그인 시 null (정답·해설은 로그인 사용자에게만) */
  correctAnswers: number[] | null;
  explanation?: string | null;
  exam: { id: number; title: string; subject: string; year: number };
  /** 비로그인 시 null */
  isBookmarked: boolean | null;
}
