import { MemorizeModePage } from "./components";

type PageProps = {
  params: Promise<{ subjectId: string; yearId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { subjectId, yearId } = await params;

  return <MemorizeModePage subjectId={subjectId} yearId={yearId} />;
}
