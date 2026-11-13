import GithubSlugger, { slug } from "github-slugger";
import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";

export type ArticleHeadingType = { depth: 2 | 3; id: string; text: string };

function headingText(node: Nodes): string {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if (node.type === "image" || node.type === "imageReference") return node.alt ?? "";
  if (node.type === "break") return " ";
  return "children" in node ? node.children.map(headingText).join("") : "";
}

/** The renderer and link validator must use the same anchor IDs, including duplicates. */
export function getArticleHeadings(body: string): ArticleHeadingType[] {
  const slugger = new GithubSlugger();
  const headings: ArticleHeadingType[] = [];
  const visit = (node: Nodes) => {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      const text = headingText(node);
      headings.push({ depth: node.depth, id: slugger.slug(slug(text) ? text : "section"), text });
    }
    if ("children" in node) for (const child of node.children) visit(child);
  };
  visit(fromMarkdown(body));
  return headings;
}
