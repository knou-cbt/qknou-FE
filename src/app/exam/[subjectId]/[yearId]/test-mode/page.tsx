import { TestModePage } from "./components";

type PageProps = {
    params: Promise<{ subjectId: string; year: string }>;
  };
  
  export default async function Page({ params }: PageProps) {
    const { subjectId, year } = await params;
  
    return (
     <TestModePage subjectId={subjectId} year={year}/>
    );
  }
  