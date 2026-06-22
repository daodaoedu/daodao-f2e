import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";

export type CommentSegment = { type: "text" | "url"; value: string };

export function extractCommentSegments(text: string): CommentSegment[] {
  return parseTextLinks(text);
}
