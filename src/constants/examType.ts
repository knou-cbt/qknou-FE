export const EXAM_TYPE_OPTIONS = [
  { value: 1, label: "1학기 기말" },
  { value: 2, label: "2학기 기말" },
  { value: 3, label: "하계 계절학기" },
  { value: 4, label: "동계 계절학기" },
] as const;

export const EXAM_TYPE_LABEL: Record<number, string> = Object.fromEntries(
  EXAM_TYPE_OPTIONS.map((option) => [option.value, option.label])
);
