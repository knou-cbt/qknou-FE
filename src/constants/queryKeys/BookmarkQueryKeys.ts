export const BookmarkQueryKeys = {
  all: ["bookmark"] as const,
  list: () => [...BookmarkQueryKeys.all, "list"] as const,
} as const;
