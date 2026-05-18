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
 * 줄바꿈을 ReactMarkdown hard line break로 변환
 */
export function preserveLineBreaksForMarkdown(text: string): string {
  const normalized = text.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  return normalized.replace(/\n(?!\n)/g, "  \n");
}
