import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
export type HeadingType = { id: string; text: string; depth: number };
function plain(node: Nodes): string {
  if ("value" in node) return node.type === "html" ? "" : node.value;
  if ("children" in node) return node.children.map(plain).join(" ");
  return "";
}

export { getArticleHeadings as articleOutline } from "@daodao/blog-content";
export function readingMinutes(body: string) {
  const text = plain(fromMarkdown(body));
  const chinese = (text.match(/[\p{Script=Han}]/gu) || []).length;
  const words = (text.replace(/[\p{Script=Han}]/gu, " ").match(/[\p{L}\p{N}]+/gu) || []).length;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}
