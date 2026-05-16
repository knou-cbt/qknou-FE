/**
 * LaTeX/마크다운 전처리: \(...\) → $...$, <보기> 태그 제거
 */
export function preprocessMathText(text: string): string {
  return text
    .replace(/<보기>/g, "")
    .replace(/<\/보기>/g, "")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .trim();
}

/**
 * 프리뷰용: JSON의 tmp/ 경로를 API 라우트 경로로 변환
 */
export function transformPreviewImageUrl(url: string): string {
  if (url.startsWith("tmp/")) {
    return `/api/preview-image/${url.slice(4)}`;
  }
  return url;
}
