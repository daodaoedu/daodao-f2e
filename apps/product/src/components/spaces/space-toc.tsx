"use client";

import type { SpaceBlockType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";

interface SpaceTocProps {
  blocks: SpaceBlockType[];
}

/**
 * 右側區塊目錄（FR-10.x）：短橫線代表區塊，順序與清單一致，滑鼠停留顯示
 * 標題，點擊平滑捲動並保留頂部留白，捲動時高亮當前區塊。
 */
export const SpaceToc = ({ blocks }: SpaceTocProps) => {
  const t = useTranslations("space");
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const sections = blocks
      .map((block) => document.querySelector(`[data-block-id="${block.id}"]`))
      .filter((node): node is Element => node !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0]?.target.getAttribute("data-block-id");
        if (first) setActiveId(Number(first));
      },
      { rootMargin: "-72px 0px -55% 0px" }
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [blocks]);

  if (blocks.length === 0) return null;

  const scrollToBlock = (blockId: number) => {
    const node = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!(node instanceof HTMLElement)) return;
    // 頂端保留留白，不使標題貼齊視窗上緣（FR-10.6）
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY - 88,
      behavior: "smooth",
    });
  };

  return (
    <nav
      aria-label={t("toc_label")}
      className="fixed right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 xl:flex"
    >
      {blocks.map((block) => (
        <button
          key={block.id}
          type="button"
          onClick={() => scrollToBlock(block.id)}
          className="group relative flex items-center justify-end py-0.5"
        >
          <span
            className={cn(
              "block h-[3px] rounded-full transition-all",
              activeId === block.id
                ? "w-6 bg-primary-darker"
                : "w-4 bg-text-dark/25 group-hover:bg-text-dark/50"
            )}
          />
          {/* 滑鼠停留顯示區塊標題（FR-10.5） */}
          <span className="pointer-events-none absolute right-8 top-1/2 w-max max-w-[180px] -translate-y-1/2 truncate rounded-lg bg-basic-600 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {block.title || t("new_block_title")}
          </span>
        </button>
      ))}
    </nav>
  );
};
