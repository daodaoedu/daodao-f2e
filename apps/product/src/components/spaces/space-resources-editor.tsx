"use client";

import type {
  SpaceBlockType,
  SpacePracticeCardType,
  UpdateSpaceBlockRequestType,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import { Check, Link2, X } from "lucide-react";
import { useState } from "react";
import { autoNameForUrl } from "@/utils/space-link-name";

type LinkInput = NonNullable<UpdateSpaceBlockRequestType["links"]>[number];

/** Local editable row shape; practiceIds carry the FR-8.8 annotations. */
export type EditableLink = LinkInput;

export function toEditableLinks(block: SpaceBlockType): EditableLink[] {
  return block.links.map((link) => ({
    name: link.name,
    url: link.url,
    isNameCustomized: link.isNameCustomized,
    practiceIds: link.practices.map((practice) => practice.id),
  }));
}

interface SpaceResourcesEditorProps {
  links: EditableLink[];
  onChange: (links: EditableLink[]) => void;
  practices: SpacePracticeCardType[];
}

/**
 * 資源連結區塊編輯（FR-8.x）：每列名稱/網址可直接改寫、＋新增連結虛線輸入列
 * （Enter 連續建立、Esc 取消、blur 有內容則建立）、自動命名只在未自訂時覆寫、
 * 對應實踐下拉多選。
 */
export const SpaceResourcesEditor = ({ links, onChange, practices }: SpaceResourcesEditorProps) => {
  const t = useTranslations("space");
  const [adding, setAdding] = useState(false);
  const [draftUrl, setDraftUrl] = useState("");

  const updateRow = (index: number, patch: Partial<EditableLink>) => {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  };

  const commitDraft = (keepOpen: boolean) => {
    const url = draftUrl.trim();
    if (url) {
      onChange([
        ...links,
        { name: autoNameForUrl(url), url, isNameCustomized: false, practiceIds: [] },
      ]);
    }
    setDraftUrl("");
    if (!keepOpen && !url) setAdding(false);
    if (!keepOpen && url) setAdding(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {links.map((link, index) => (
        <div key={`${index}-${link.url}`} className="flex items-center gap-2">
          <Link2 className="size-4 shrink-0 text-primary-base" />
          <input
            value={link.name}
            placeholder={t("link_name_default")}
            onChange={(event) =>
              updateRow(index, { name: event.target.value, isNameCustomized: true })
            }
            className="w-[38%] min-w-0 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-text-dark focus:border-primary-base focus:outline-none"
          />
          <input
            value={link.url}
            onChange={(event) => {
              const url = event.target.value;
              // 自動命名只在名稱空或仍為預設值時覆寫（FR-8.6）
              const shouldRename = !link.isNameCustomized || !link.name;
              updateRow(index, {
                url,
                ...(shouldRename ? { name: autoNameForUrl(url), isNameCustomized: false } : {}),
              });
            }}
            className="min-w-0 flex-1 truncate rounded-lg border border-transparent px-2 py-1.5 text-xs text-text-dark/60 focus:border-primary-base focus:outline-none"
          />
          <Popover>
            <PopoverTrigger
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors",
                link.practiceIds.length > 0
                  ? "border-logo-orange/50 bg-logo-orange/10 text-text-dark"
                  : "border-[#DCEBEA] text-text-dark/60 hover:border-primary-base/50"
              )}
            >
              {link.practiceIds.length > 0
                ? t("practice_tag_count", { count: link.practiceIds.length })
                : t("practice_tag_empty")}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1.5">
              {practices.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-text-dark/50">{t("empty_list")}</p>
              ) : (
                practices.map((practice) => {
                  const selected = link.practiceIds.includes(practice.id);
                  return (
                    <button
                      key={practice.id}
                      type="button"
                      onClick={() =>
                        updateRow(index, {
                          practiceIds: selected
                            ? link.practiceIds.filter((id) => id !== practice.id)
                            : [...link.practiceIds, practice.id],
                        })
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-text-dark hover:bg-[#F0F9F8]"
                    >
                      <span
                        className={cn(
                          "inline-flex size-4 items-center justify-center rounded border",
                          selected
                            ? "border-primary-base bg-primary-base text-white"
                            : "border-[#CBD5D4]"
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{practice.title}</span>
                    </button>
                  );
                })
              )}
            </PopoverContent>
          </Popover>
          <button
            type="button"
            aria-label={t("remove_row")}
            onClick={() => onChange(links.filter((_, i) => i !== index))}
            className="shrink-0 rounded-full p-1 text-text-dark/40 transition-colors hover:bg-[#FBE9E7] hover:text-red"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <div>
          <input
            autoFocus
            value={draftUrl}
            placeholder={t("link_placeholder")}
            onChange={(event) => setDraftUrl(event.target.value)}
            onKeyDown={(event) => {
              // Enter 建立並保持輸入列開啟以便連續貼上（FR-8.3）
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraft(true);
              }
              if (event.key === "Escape") {
                setDraftUrl("");
                setAdding(false);
              }
            }}
            onBlur={() => commitDraft(false)}
            className="w-full rounded-lg border border-dashed border-primary-base/60 px-3 py-2 text-sm text-text-dark focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-dark/45">{t("link_hint")}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start rounded-full px-2 py-1 text-xs text-primary-base transition-colors hover:bg-[#F0F9F8]"
        >
          {t("add_link")}
        </button>
      )}
    </div>
  );
};
