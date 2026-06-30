export function isBlankContent(content: string | null | undefined): boolean {
  return !content || content.trim().length === 0;
}
