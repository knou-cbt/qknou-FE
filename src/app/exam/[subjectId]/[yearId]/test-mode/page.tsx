import { TestModePage } from "./components";

type PageProps = {
    params: Promise<{ subjectId: string; yearId: string }>;
  };
  
  export default async function Page({ params }: PageProps) {
    const { subjectId, yearId } = await params;
  
    return (
     <TestModePage subjectId={subjectId} yearId={yearId}/>
    );
  }
  