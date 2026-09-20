import type { Metadata } from "next";

import { QuestionApiPaths } from "@/constants";
import { SharedQuestionPage } from "./components/SharedQuestionPage";

type PageProps = {
  params: Promise<{ questionId: string }>;
};

interface IApiResponse<T> {
  success: boolean;
  data: T;
}

interface IQuestionMeta {
  questionNumber: number;
  exam: { subject: string; year: number };
}

async function getQuestionMeta(questionId: string): Promise<IQuestionMeta | null> {
  try {
    const res = await fetch(QuestionApiPaths.detail(questionId), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json: IApiResponse<IQuestionMeta> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { questionId } = await params;
  const meta = await getQuestionMeta(questionId);

  const title = meta
    ? `${meta.exam.subject} ${meta.exam.year}년 ${meta.questionNumber}번 문항`
    : "공유된 문항";
  const description = meta
    ? `${meta.exam.subject} · ${meta.exam.year}년 기출문제 ${meta.questionNumber}번 문항을 큐노에서 확인하세요.`
    : "큐노에서 공유된 기출문제 문항을 확인하세요.";

  return {
    title,
    description,
    alternates: {
      canonical: `/memorize/${questionId}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { questionId } = await params;

  return <SharedQuestionPage questionId={questionId} />;
}
