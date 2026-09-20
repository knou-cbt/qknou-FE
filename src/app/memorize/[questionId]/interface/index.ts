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
  correctAnswers: number[];
  explanation?: string | null;
  exam: { id: number; title: string; subject: string; year: number };
  /** 비로그인 시 null */
  isBookmarked: boolean | null;
}
