import fs from "fs";
import path from "path";
import { PreviewContent } from "./PreviewContent";
import { transformPreviewImageUrl } from "@/lib/math-text";

export interface PreviewChoice {
  number: number;
  text: string;
  imageUrls: string[] | null;
}

export interface PreviewQuestion {
  questionNumber: number;
  page: number;
  questionText: string;
  exampleText: string | null;
  sharedExample: string | null;
  questionImageUrls: string[] | null;
  choices: PreviewChoice[];
  needsNonTextRecovery: boolean;
}

function transformQuestion(q: PreviewQuestion): PreviewQuestion {
  const mapUrls = (urls: string[] | null) =>
    urls ? urls.map(transformPreviewImageUrl) : null;

  return {
    ...q,
    questionImageUrls: mapUrls(q.questionImageUrls),
    choices: q.choices.map((c) => ({
      ...c,
      imageUrls: mapUrls(c.imageUrls),
    })),
  };
}

export default function PreviewPage() {
  const jsonPath = path.join(
    process.cwd(),
    "refs",
    "252-알고리즘-3학년-3교시-(3p)",
    "structured-questions.json"
  );
  const raw: PreviewQuestion[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const questions = raw.map(transformQuestion);

  return <PreviewContent questions={questions} />;
}
