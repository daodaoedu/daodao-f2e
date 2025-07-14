import dynamic from "next/dynamic";

export const MarkdownEditor = dynamic(() => import("./markdown-editor"), {
  ssr: false,
});
