import type { BaseEditor, Descendant } from "slate";
import type { HistoryEditor } from "slate-history";
import type { ReactEditor } from "slate-react";

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type EmptyText = {
  text: "";
};

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

export type CustomText = FormattedText;

export type ListItemElement = {
  type: "list-item";
  children: Descendant[];
};

export type ParagraphElement = {
  type: "paragraph";
  children: Descendant[];
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingElement = {
  type: `heading-${HeadingLevel}`;
  children: Descendant[];
};

export type BlockQuoteElement = {
  type: "block-quote";
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  children: ListItemElement[];
};

export type NumberedListElement = {
  type: "numbered-list";
  children: ListItemElement[];
};

export type LinkElement = {
  type: "link";
  url: string;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  alt?: string;
  title?: string;
  children: EmptyText[];
};

export type ThematicBreakElement = {
  type: "thematic-break";
  children: EmptyText[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | LinkElement
  | ImageElement
  | ThematicBreakElement;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface MarkdownEditorProps {
  readOnly?: boolean;
  hasHeadings?: boolean;
  value?: string;
  placeholder?: string;
  rootClassName?: string;
  className?: string;
  editorClassName?: string;
  suppressLinkDefaultPrevent?: boolean;
  disabledProse?: boolean;
  maxLength?: number;
  onChange?: (value: string) => void;
}

export interface MarkdownEditorMethods {
  focus: () => void;
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  insertMarkdown: (markdown: string) => void;
}
