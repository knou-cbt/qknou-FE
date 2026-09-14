import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BookmarkQueryKeys, QuestionQueryKeys } from "@/constants";
import { useAuth } from "@/contexts";

import { addBookmark, getBookmarks, removeBookmark } from "../api";

/** 북마크 목록 조회 훅 */
export const useBookmarkListQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: BookmarkQueryKeys.list(),
    queryFn: getBookmarks,
    enabled: isAuthenticated,
  });
};

interface IToggleBookmarkVariables {
  questionId: number;
  next: boolean;
}

/** 북마크 등록/해제 토글 뮤테이션 */
export const useToggleBookmarkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, next }: IToggleBookmarkVariables) =>
      next ? addBookmark(questionId) : removeBookmark(questionId),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: BookmarkQueryKeys.list() });
      if (variables) {
        queryClient.invalidateQueries({
          queryKey: QuestionQueryKeys.detail(variables.questionId),
        });
      }
    },
  });
};
