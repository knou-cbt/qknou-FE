import { TestModePage } from "@/modules/exam";

type PageProps = {
    params: Promise<{ subjectId: string; yearId: string }>;
  };
  
  export default async function Page({ params }: PageProps) {
    const { yearId } = await params;
    return (
     <TestModePage yearId={yearId}/>
    );
  }
