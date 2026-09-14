import { useQuery } from "@tanstack/react-query";

import { NoticeQueryKeys } from "@/constants";

import { getActiveNotices } from "../api";

/** 활성 공지 조회 훅 */
export const useActiveNoticesQuery = () => {
  return useQuery({
    queryKey: NoticeQueryKeys.active(),
    queryFn: getActiveNotices,
    staleTime: 5 * 60 * 1000,
  });
};
