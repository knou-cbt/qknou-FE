import { MemorizeModePage } from "./components";

type PageProps = {
    params: Promise<{ subjectId: string; year: string }>;
  };
  
  export default async function Page({ params }: PageProps) {
    const { subjectId, year } = await params;
  
    return (
     <MemorizeModePage subjectId={subjectId} year={year}/>
    );
  }
  