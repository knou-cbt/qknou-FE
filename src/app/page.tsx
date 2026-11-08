import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { MainContainer } from "@/components";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { SubjectQueryKeys } from "@/constants";
import { getSubjectList } from "@/app/exam/[subjectId]/year/hooks/api";

/**
 * 빌드 시점 정적 생성을 막는다. docker build 중에는 백엔드(API_PROXY_TARGET)에 닿지 않아
 * 과목 표 없이 굳어버리므로 요청 시 렌더하고, 데이터는 fetch revalidate로 1시간 캐시한다.
 */
export const dynamic = "force-dynamic";

/** MainContainer의 첫 화면 조회 조건과 같아야 서버에서 받은 데이터가 그대로 쓰인다 */
const INITIAL_SUBJECT_LIST_PARAMS = { search: undefined, page: 1, limit: 10 };

export default async function Home() {
  // 과목 표를 서버에서 미리 조회해 HTML에 포함 (크롤러가 "불러오는 중"만 보지 않도록)
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: SubjectQueryKeys.list(INITIAL_SUBJECT_LIST_PARAMS),
    queryFn: () =>
      getSubjectList(INITIAL_SUBJECT_LIST_PARAMS, { next: { revalidate: 3600 } }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdSenseScript />
      <MainContainer />
    </HydrationBoundary>
  );
}
