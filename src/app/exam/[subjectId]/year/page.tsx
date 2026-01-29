import { ExamYearPage } from "@/modules/exam";

type PageProps = {
  params: Promise<{ subjectId : string }>;
};

export default async function Page({ params }: PageProps) {
  const { subjectId  } = await params;
  return <ExamYearPage subjectId={subjectId} />;
}
