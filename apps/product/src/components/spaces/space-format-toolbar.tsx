"use client";

import { useTranslations } from "@daodao/i18n";
import { Bold, Italic, Link2, List } from "lucide-react";
import { useState } from "react";

interface SpaceFormatToolbarProps {
  /** The last-focused body textarea; formatting applies to its selection. */
  getTarget: () => HTMLTextAreaElement | null;
}

/** Wrap the selection with markdown tokens and restore focus. */
function applyWrap(textarea: HTMLTextAreaElement, before: string, after = before): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const next =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  setNativeValue(textarea, next);
  textarea.focus();
  textarea.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
}

/** Prefix each selected line with "- " (FR-6.4 項目清單). */
function applyList(textarea: HTMLTextAreaElement): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const segment = value.slice(lineStart, selectionEnd);
  const listed = segment
    .split("\n")
    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
    .join("\n");
  setNativeValue(textarea, value.slice(0, lineStart) + listed + value.slice(selectionEnd));
  textarea.focus();
}

/** Set value through the native setter so React onChange fires. */
function setNativeValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * 置頂浮動格式列（FR-6.4）：粗體/斜體/項目清單/插入連結（markdown 語法），
 * 任一區塊編輯中時顯示。插入連結展開網址輸入，未輸入或取消不套用（FR-6.5）。
 */
export const SpaceFormatToolbar = ({ getTarget }: SpaceFormatToolbarProps) => {
  const t = useTranslations("space");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const withTarget = (apply: (textarea: HTMLTextAreaElement) => void) => {
    const target = getTarget();
    if (target) apply(target);
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (url) {
      withTarget((textarea) => applyWrap(textarea, "[", `](${url})`));
    }
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <div className="sticky top-2 z-20 mb-3 flex items-center gap-1 rounded-full border border-[#E4EAE9] bg-white px-2 py-1.5 shadow-[0_6px_18px_rgba(15,48,54,0.1)]">
      <button
        type="button"
        aria-label={t("format_bold")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => withTarget((textarea) => applyWrap(textarea, "**"))}
        className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
      >
        <Bold className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t("format_italic")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => withTarget((textarea) => applyWrap(textarea, "*"))}
        className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
      >
        <Italic className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t("format_list")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => withTarget(applyList)}
        className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t("format_link")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setLinkOpen((open) => !open)}
        className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
      >
        <Link2 className="size-4" />
      </button>
      {linkOpen && (
        <input
          autoFocus
          value={linkUrl}
          placeholder={t("link_prompt")}
          onChange={(event) => setLinkUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") insertLink();
            if (event.key === "Escape") {
              setLinkUrl("");
              setLinkOpen(false);
            }
          }}
          className="w-44 rounded-full border border-[#DCEBEA] px-3 py-1 text-xs text-text-dark focus:border-primary-base focus:outline-none"
        />
      )}
      <p className="ml-auto hidden pr-2 text-[11px] text-text-dark/40 sm:block">
        {t("format_hint")}
      </p>
    </div>
  );
};
