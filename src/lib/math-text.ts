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

