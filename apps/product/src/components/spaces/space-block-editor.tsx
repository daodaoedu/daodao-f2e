"use client";

import {
  deleteSpaceBlock,
  draftSpaceBlock,
  moveSpaceBlock,
  publishSpaceBlock,
  type SpaceBlockType,
  type SpacePracticeCardType,
  type UpdateSpaceBlockRequestType,
  updateSpaceBlock,
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
import { cn } from "@daodao/ui/lib/utils";
import { ArrowDown, ArrowUp, Pencil, Pin, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SpaceBlockView } from "./space-block-view";
import { type EditableEvent, SpaceCalendarEditor, toEditableEvents } from "./space-calendar-editor";
import { type EditableLink, SpaceResourcesEditor, toEditableLinks } from "./space-resources-editor";

/** Format YYYY/MM/DD HH:MM for the scheduled badge (FR-7.1). */
function formatScheduleTime(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface SpaceBlockEditorProps {
  spaceId: string;
  block: SpaceBlockType;
  practices: SpacePracticeCardType[];
  /** Whether a non-pinned neighbor exists above/below (FR-6.6/6.7). */
  canMoveUp: boolean;
  canMoveDown: boolean;
  editing: boolean;
  onEditingChange: (blockId: number, editing: boolean) => void;
  /** Register the body textarea so the shared format toolbar can target it. */
  onTextareaFocus: (textarea: HTMLTextAreaElement | null) => void;
  /** Refresh the home page after any mutation. */
  onMutated: () => Promise<void>;
}

/**
 * 發起人視角的區塊卡（FR-6.x/7.x）：鉛筆進入編輯，虛線框＋浮動編輯列
 * （上移/下移/刪除/存草稿/發佈/存檔），底部發佈狀態徽章與排程輸入。
 */
export const SpaceBlockEditor = ({
  spaceId,
  block,
  practices,
  canMoveUp,
  canMoveDown,
  editing,
  onEditingChange,
  onTextareaFocus,
  onMutated,
}: SpaceBlockEditorProps) => {
  const t = useTranslations("space");
  const [title, setTitle] = useState(block.title);
  const [body, setBody] = useState(block.body ?? "");
  const [links, setLinks] = useState<EditableLink[]>(() => toEditableLinks(block));
  const [events, setEvents] = useState<EditableEvent[]>(() => toEditableEvents(block));
  const [scheduleAt, setScheduleAt] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Latest content for the unmount flush (FR-2.5: 切分頁不得遺失已輸入內容).
  const latest = useRef({ editing, title, body, links, events, dirty: false });
  latest.current = { ...latest.current, editing, title, body, links, events };

  const contentPayload = (): UpdateSpaceBlockRequestType => ({
    title: latest.current.title,
    ...(block.blockType === "text" ? { body: latest.current.body } : {}),
    ...(block.blockType === "resources" ? { links: latest.current.links } : {}),
    ...(block.blockType === "calendar" ? { events: latest.current.events } : {}),
  });

  const saveContent = async (): Promise<boolean> => {
    const response = await updateSpaceBlock(spaceId, block.id, contentPayload());
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save"));
      return false;
    }
    latest.current.dirty = false;
    return true;
  };

  useEffect(() => {
    // Flush unsaved edits when the editor unmounts mid-edit (tab switch).
    return () => {
      if (latest.current.editing && latest.current.dirty) {
        updateSpaceBlock(spaceId, block.id, contentPayload()).catch((error: unknown) => {
          console.error("Failed to flush block edits on unmount", error);
        });
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: flush-on-unmount reads refs only
  }, []);

  const markDirty = () => {
    latest.current.dirty = true;
  };

  const runAction = async (action: () => Promise<{ error?: unknown }>) => {
    setIsBusy(true);
    const saved = await saveContent();
    if (saved) {
      const response = await action();
      if (response.error) {
        const message = (response.error as { error?: { message?: string } }).error?.message;
        toast.error(message ?? t("save"));
      }
    }
    await onMutated();
    setIsBusy(false);
  };

  const closeEditing = () => onEditingChange(block.id, false);

  const effectiveStatus = block.publishStatus;
  const showSaveDraft = effectiveStatus !== "published";

  if (!editing) {
    return (
      <section
        data-block-id={block.id}
        className="group relative rounded-2xl border border-[#E4EAE9] bg-white px-5 py-4"
      >
        <button
          type="button"
          aria-label={t("edit")}
          onClick={() => onEditingChange(block.id, true)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-text-dark/35 opacity-0 transition-opacity hover:bg-[#F0F9F8] hover:text-text-dark focus:opacity-100 group-hover:opacity-100"
        >
          <Pencil className="size-4" />
        </button>
        <h3 className="mb-2.5 flex items-center gap-1.5 text-base font-semibold text-basic-600">
          {block.isPinned && <Pin className="size-3.5 text-logo-orange" />}
          {block.title}
        </h3>
        <SpaceBlockView block={block} />
        <StatusBadge block={block} />
      </section>
    );
  }

  return (
    <section data-block-id={block.id} className="relative">
      {/* 浮動編輯列（FR-6.2） */}
      <div className="absolute -top-4 right-3 z-10 flex items-center gap-0.5 rounded-full border border-[#E4EAE9] bg-white px-1.5 py-1 shadow-[0_4px_12px_rgba(15,48,54,0.12)]">
        <button
          type="button"
          aria-label={t("move_up")}
          disabled={block.isPinned || !canMoveUp || isBusy}
          onClick={() =>
            void runAction(() => moveSpaceBlock(spaceId, block.id, { direction: "up" }))
          }
          className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8] disabled:cursor-not-allowed disabled:text-text-dark/20"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t("move_down")}
          disabled={block.isPinned || !canMoveDown || isBusy}
          onClick={() =>
            void runAction(() => moveSpaceBlock(spaceId, block.id, { direction: "down" }))
          }
          className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#F0F9F8] disabled:cursor-not-allowed disabled:text-text-dark/20"
        >
          <ArrowDown className="size-4" />
        </button>
        {block.isPinned && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void runAction(() => updateSpaceBlock(spaceId, block.id, { isPinned: false }))
            }
            className="rounded-full px-2 py-1 text-xs text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
          >
            {t("unpin")}
          </button>
        )}
        <button
          type="button"
          aria-label={t("delete")}
          disabled={isBusy}
          onClick={() => setDeleteOpen(true)}
          className="rounded-full p-1.5 text-text-dark/70 transition-colors hover:bg-[#FBE9E7] hover:text-red"
        >
          <Trash2 className="size-4" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-[#EEF3F3]" />
        {showSaveDraft && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void runAction(() => draftSpaceBlock(spaceId, block.id)).then(closeEditing)
            }
            className="rounded-full px-2.5 py-1 text-xs text-text-dark/70 transition-colors hover:bg-[#F0F9F8]"
          >
            {t("save_draft")}
          </button>
        )}
        {effectiveStatus === "published" ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              void (async () => {
                setIsBusy(true);
                const saved = await saveContent();
                setIsBusy(false);
                if (saved) {
                  await onMutated();
                  closeEditing();
                }
              })();
            }}
            className="rounded-full bg-primary-base px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-base/90"
          >
            {t("save")}
          </button>
        ) : (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void runAction(() =>
                publishSpaceBlock(
                  spaceId,
                  block.id,
                  scheduleAt ? { scheduledAt: new Date(scheduleAt).toISOString() } : {}
                )
              ).then(closeEditing)
            }
            className="rounded-full bg-primary-base px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-base/90"
          >
            {t("publish_now")}
          </button>
        )}
      </div>

      {/* 虛線框編輯區（FR-6.2） */}
      <div className="rounded-2xl border-2 border-dashed border-primary-base/50 bg-white px-5 pb-4 pt-5">
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            markDirty();
          }}
          onBlur={() => void saveContent().then(() => onMutated())}
          className="mb-2.5 w-full rounded-lg border border-transparent text-base font-semibold text-basic-600 focus:border-primary-base focus:outline-none"
        />
        {block.blockType === "text" && (
          <textarea
            value={body}
            placeholder={t("text_placeholder")}
            rows={Math.max(3, body.split("\n").length)}
            onFocus={(event) => onTextareaFocus(event.currentTarget)}
            onChange={(event) => {
              setBody(event.target.value);
              markDirty();
            }}
            onBlur={() => void saveContent().then(() => onMutated())}
            className="w-full resize-y rounded-lg border border-transparent text-[15px] leading-relaxed text-text-dark placeholder:text-text-dark/35 focus:border-primary-base focus:outline-none"
          />
        )}
        {block.blockType === "resources" && (
          <div onBlur={() => void saveContent()}>
            <SpaceResourcesEditor
              links={links}
              onChange={(next) => {
                setLinks(next);
                markDirty();
              }}
              practices={practices}
            />
          </div>
        )}
        {block.blockType === "calendar" && (
          <div onBlur={() => void saveContent()}>
            <SpaceCalendarEditor
              events={events}
              onChange={(next) => {
                setEvents(next);
                markDirty();
              }}
            />
          </div>
        )}

        {/* 區塊底部：狀態徽章與排程（FR-7.1/7.4） */}
        <div className="mt-3 flex items-center gap-2 border-t border-[#F0F4F3] pt-3">
          <StatusBadge block={block} />
          <div className="flex-1" />
          {showSaveDraft && (
            <label className="flex items-center gap-1.5 text-xs text-text-dark/55">
              {t("schedule_label")}
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(event) => setScheduleAt(event.target.value)}
                className="rounded-lg border border-[#DCEBEA] px-2 py-1 text-xs text-text-dark focus:border-primary-base focus:outline-none"
              />
            </label>
          )}
        </div>
      </div>

      {/* 刪除確認（FR-6.8） */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-[360px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg text-text-dark">
              {t("delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-text-dark/60">
              {t("delete_confirm_body")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setDeleteOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="alert"
              className="rounded-full"
              disabled={isBusy}
              onClick={() => {
                void (async () => {
                  setIsBusy(true);
                  const response = await deleteSpaceBlock(spaceId, block.id);
                  if (response.error) {
                    toast.error(response.error.error?.message ?? t("delete"));
                  }
                  setDeleteOpen(false);
                  setIsBusy(false);
                  closeEditing();
                  await onMutated();
                })();
              }}
            >
              {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

/** 發起人視角的發佈狀態徽章（FR-7.1）；成員視角不顯示（由 host 判斷控制渲染）。 */
const StatusBadge = ({ block }: { block: SpaceBlockType }) => {
  const t = useTranslations("space");
  return (
    <span
      className={cn(
        "mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        block.publishStatus === "draft" && "bg-basic-100 text-text-dark/60",
        block.publishStatus === "scheduled" && "bg-[#FDF3DC] text-[#9A6B15]",
        block.publishStatus === "published" && "bg-primary-base/12 text-primary-base"
      )}
    >
      {block.publishStatus === "draft" && t("status_draft")}
      {block.publishStatus === "scheduled" &&
        block.scheduledAt &&
        t("status_scheduled", { time: formatScheduleTime(block.scheduledAt) })}
      {block.publishStatus === "published" && t("status_published")}
    </span>
  );
};
