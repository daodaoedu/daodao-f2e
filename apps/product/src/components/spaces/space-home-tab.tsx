"use client";

import {
  createSpaceBlock,
  createSpaceHomePage,
  publishSpaceHomePage,
  type SpaceHomePageType,
  type SpacePracticeCardType,
  useMutate,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { CalendarRange, FileText, LayoutTemplate, Link2, Megaphone, Type } from "lucide-react";
import { useRef, useState } from "react";
import { SpaceBlockEditor } from "./space-block-editor";
import { SpaceBlockView } from "./space-block-view";
import { SpaceFormatToolbar } from "./space-format-toolbar";
import { SpaceToc } from "./space-toc";

interface SpaceHomeTabProps {
  spaceId: string;
  homePage: NonNullable<SpaceHomePageType>;
  isHost: boolean;
  /** Practices in the space, for the resource-link annotations (FR-8.8). */
  practices: SpacePracticeCardType[];
  /** Editing-block ids, lifted to the page so tab remounts keep the state. */
  editingIds: Set<number>;
  onEditingChange: (blockId: number, editing: boolean) => void;
}

/**
 * 空間首頁分頁：頁面層級草稿橫幅與發佈（FR-4.1/4.2），區塊唯讀清單。
 * 區塊編輯鏈（新增/排序/發佈）由 host 專屬的編輯元件擴充。
 */
export const SpaceHomeTab = ({
  spaceId,
  homePage,
  isHost,
  practices,
  editingIds,
  onEditingChange,
}: SpaceHomeTabProps) => {
  const t = useTranslations("space");
  const mutate = useMutate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  const refresh = async () => {
    await mutate(["/api/v1/spaces/{id}/home-page", { params: { path: { id: spaceId } } }] as const);
    await mutate(["/api/v1/spaces/{id}", { params: { path: { id: spaceId } } }] as const);
  };

  const publishPage = async () => {
    setIsPublishing(true);
    const response = await publishSpaceHomePage(spaceId);
    setIsPublishing(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("publish_page"));
      return;
    }
    await refresh();
  };

  // 新增的區塊一律附加於最後並立即進入編輯狀態（FR-5.4）
  const addBlock = async (blockType: "text" | "resources" | "calendar") => {
    setIsAddingBlock(true);
    const response = await createSpaceBlock(spaceId, { blockType });
    setIsAddingBlock(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("add_block"));
      return;
    }
    const created = response.data?.data;
    await refresh();
    if (created) onEditingChange(created.id, true);
  };

  const anyEditing = editingIds.size > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 任一區塊編輯中時顯示置頂格式列（FR-6.4） */}
      {isHost && anyEditing && <SpaceFormatToolbar getTarget={() => activeTextarea.current} />}
      {isHost && homePage.status === "draft" && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#F4E3C0] bg-[#FFF9EC] px-4 py-3">
          <Megaphone className="size-4 shrink-0 text-logo-orange" />
          <p className="min-w-0 flex-1 text-sm text-text-dark">{t("page_draft_banner")}</p>
          <Button
            size="sm"
            className="rounded-full"
            disabled={isPublishing}
            onClick={() => void publishPage()}
          >
            {t("publish_page")}
          </Button>
        </div>
      )}
      {homePage.blocks.map((block, index) =>
        isHost ? (
          <SpaceBlockEditor
            key={block.id}
            spaceId={spaceId}
            block={block}
            practices={practices}
            canMoveUp={homePage.blocks.slice(0, index).some((other) => !other.isPinned)}
            canMoveDown={homePage.blocks.slice(index + 1).some((other) => !other.isPinned)}
            editing={editingIds.has(block.id)}
            onEditingChange={onEditingChange}
            onTextareaFocus={(textarea) => {
              activeTextarea.current = textarea;
            }}
            onMutated={refresh}
          />
        ) : (
          // 成員視角：無編輯鈕、無狀態徽章（FR-6.1/7.3）
          <section
            key={block.id}
            data-block-id={block.id}
            className="rounded-2xl border border-[#E4EAE9] bg-white px-5 py-4"
          >
            <h3 className="mb-2.5 text-base font-semibold text-basic-600">{block.title}</h3>
            <SpaceBlockView block={block} />
          </section>
        )
      )}

      {/* 新增區塊列：僅發起人可見、固定在最後（FR-5.3/5.8） */}
      {isHost && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#CBDBD9] px-4 py-3">
          <span className="text-xs text-text-dark/50">{t("add_block")}</span>
          <div className="flex-1" />
          <button
            type="button"
            disabled={isAddingBlock}
            onClick={() => void addBlock("text")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEBEA] px-3 py-1.5 text-xs text-text-dark transition-colors hover:border-primary-base/50 hover:bg-[#F7FBFA]"
          >
            <Type className="size-3.5" />
            {t("block_text")}
          </button>
          <button
            type="button"
            disabled={isAddingBlock}
            onClick={() => void addBlock("resources")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEBEA] px-3 py-1.5 text-xs text-text-dark transition-colors hover:border-primary-base/50 hover:bg-[#F7FBFA]"
          >
            <Link2 className="size-3.5" />
            {t("block_resources")}
          </button>
          <button
            type="button"
            disabled={isAddingBlock}
            onClick={() => void addBlock("calendar")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEBEA] px-3 py-1.5 text-xs text-text-dark transition-colors hover:border-primary-base/50 hover:bg-[#F7FBFA]"
          >
            <CalendarRange className="size-3.5" />
            {t("block_calendar")}
          </button>
        </div>
      )}

      {/* 右側區塊目錄（FR-10.x）；編輯中/草稿/排程對檢視者不可見的不出現——
          成員視角 server 已過濾，host 視角全部顯示 */}
      <SpaceToc blocks={homePage.blocks} />
    </div>
  );
};

interface SpaceHomeGuideProps {
  spaceId: string;
  /** Collapsed after 先不用 (FR-3.3); the tab-row entry stays available. */
  collapsed: boolean;
  onCollapse: () => void;
  onCreated: () => void;
  /** 從哪裡開始 dialog state, lifted so the tab-row entry can open it too. */
  startOpen: boolean;
  onStartOpenChange: (open: boolean) => void;
}

/**
 * 首頁建立流程 (FR-3.x): the guide card, the 從哪裡開始 dialog, and the
 * permanent low-key entry once the card is dismissed.
 */
export const SpaceHomeGuide = ({
  spaceId,
  collapsed,
  onCollapse,
  onCreated,
  startOpen,
  onStartOpenChange,
}: SpaceHomeGuideProps) => {
  const t = useTranslations("space");
  const mutate = useMutate();
  const [isCreating, setIsCreating] = useState(false);

  const create = async (template: "example" | "blank") => {
    setIsCreating(true);
    const response = await createSpaceHomePage(spaceId, { template });
    setIsCreating(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("guide_create"));
      return;
    }
    onStartOpenChange(false);
    await mutate(["/api/v1/spaces/{id}/home-page", { params: { path: { id: spaceId } } }] as const);
    await mutate(["/api/v1/spaces/{id}", { params: { path: { id: spaceId } } }] as const);
    onCreated();
  };

  return (
    <>
      {!collapsed && (
        <div className="rounded-2xl border border-[#CDEBE8] bg-[#F0FAF8] px-5 py-4">
          <p className="text-sm font-semibold text-text-dark">{t("guide_title")}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-text-dark/60">{t("guide_body")}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="rounded-full" onClick={() => onStartOpenChange(true)}>
              {t("guide_create")}
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={onCollapse}>
              {t("guide_skip")}
            </Button>
          </div>
        </div>
      )}
      <Dialog open={startOpen} onOpenChange={onStartOpenChange}>
        <DialogContent className="max-w-[420px] rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-text-dark">{t("start_title")}</DialogTitle>
            <DialogDescription className="text-sm text-text-dark/60">
              {t("start_note")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isCreating}
              onClick={() => void create("example")}
              className="flex items-center gap-3 rounded-2xl border border-[#DCEBEA] px-4 py-3.5 text-left transition-colors hover:border-primary-base/55 hover:bg-[#F7FBFA]"
            >
              <LayoutTemplate className="size-5 shrink-0 text-primary-base" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-dark">
                  {t("start_example")}
                </span>
                <span className="mt-0.5 block text-xs text-text-dark/55">
                  {t("start_example_hint")}
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={isCreating}
              onClick={() => void create("blank")}
              className="flex items-center gap-3 rounded-2xl border border-[#DCEBEA] px-4 py-3.5 text-left transition-colors hover:border-primary-base/55 hover:bg-[#F7FBFA]"
            >
              <FileText className="size-5 shrink-0 text-text-dark/60" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-dark">
                  {t("start_blank")}
                </span>
                <span className="mt-0.5 block text-xs text-text-dark/55">
                  {t("start_blank_hint")}
                </span>
              </span>
            </button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => onStartOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/** 分頁列右端的低調建立入口（FR-3.3），永久保留。 */
export const SpaceHomeCreateButton = ({ onClick }: { onClick: () => void }) => {
  const t = useTranslations("space");
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1.5 text-xs text-text-dark/50 transition-colors hover:bg-[#F0F9F8] hover:text-text-dark"
    >
      {t("guide_add_button")}
    </button>
  );
};
