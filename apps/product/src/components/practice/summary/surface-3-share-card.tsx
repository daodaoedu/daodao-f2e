"use client";

import { type PracticeSummary, updatePractice, usePracticeCheckIns } from "@daodao/api";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { Switch } from "@daodao/ui/components/switch";
import { cn } from "@daodao/ui/lib/utils";
import { differenceInCalendarDays, format, isValid, parse } from "date-fns";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Home,
  Info,
  Lock,
  LockOpen,
  Pencil,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePracticeSummaryImage, useReflection } from "./hooks";
import { CheckinPickerSheet, type PickerCheckIn } from "./sections/checkin-picker-sheet";
import { SHARE_CARD_THEMES, ShareCardPreview } from "./sections/share-card-preview";

interface Surface3Props {
  summary: PracticeSummary;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  selectedCheckInIds: string[];
  onSelectedChange: (ids: string[]) => void;
  themeIndex: number;
  onThemeChange: (index: number) => void;
  onSurfaceChange: (surface: 1 | 2) => void;
}

const THEME_SWATCHES = [
  { bg: "#0f3036", border: undefined },
  { bg: "#f4f6f6", border: "#e5e7eb" },
  { bg: "#16b9b3", border: undefined },
  { bg: "#f9e41c", border: undefined },
] as const;

const COPY_FEEDBACK_MS = 1500;
const LINK_GENERATE_DELAY_MS = 700;

/** 將 checkin 的日期換算成第幾天（相對於實踐開始日） */
function formatCheckInDay(checkinDate: string, startDate: string): number {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  if (!isValid(start) || !isValid(date)) return 0;
  return differenceInCalendarDays(date, start) + 1;
}

function formatCheckInDisplayDate(checkinDate: string): string {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return checkinDate;
  return format(date, "yyyy/MM/dd");
}

/**
 * Surface 3 — 製作分享卡
 * @description 打卡精選編輯、背景主題選擇、分享卡預覽（含反思內聯編輯）、下載圖片、公開此成就頁面
 */
export function Surface3ShareCard({
  summary,
  reflectionText,
  onReflectionChange,
  selectedCheckInIds,
  onSelectedChange,
  themeIndex,
  onThemeChange,
  onSurfaceChange,
}: Surface3Props) {
  const { open } = useSheetManager();
  const { save: saveReflection, isSaving: isSavingReflection } = useReflection(summary.practiceId);
  const { summaryCardRef, isGenerating, downloadImage } = usePracticeSummaryImage({
    practiceName: summary.practiceName,
  });

  const { data: checkInsData } = usePracticeCheckIns(summary.practiceId, { limit: 100 });

  const allCheckIns = useMemo<PickerCheckIn[]>(() => {
    return (checkInsData?.data ?? []).map((checkIn) => ({
      id: String(checkIn.id),
      day: formatCheckInDay(checkIn.checkinDate, summary.startDate),
      date: formatCheckInDisplayDate(checkIn.checkinDate),
      note: checkIn.note ?? "",
    }));
  }, [checkInsData, summary.startDate]);

  // 若尚未選過精選打卡，預設挑選字數最多的 3 則
  useEffect(() => {
    if (selectedCheckInIds.length > 0 || allCheckIns.length === 0) return;
    const defaultIds = [...allCheckIns]
      .sort((a, b) => b.note.length - a.note.length)
      .slice(0, 3)
      .map((checkIn) => checkIn.id);
    if (defaultIds.length > 0) {
      onSelectedChange(defaultIds);
    }
  }, [allCheckIns, selectedCheckInIds.length, onSelectedChange]);

  const featuredCheckIns = allCheckIns
    .filter((checkIn) => selectedCheckInIds.includes(checkIn.id))
    .sort((a, b) => b.day - a.day);

  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState(reflectionText);

  const [isPublic, setIsPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [linkReady, setLinkReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
    };
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/practices/${summary.practiceId}/summary`
      : "";

  const handleOpenPicker = () => {
    const { close } = open({
      title: "選擇你的打卡精選",
      content: (
        <CheckinPickerSheet
          checkIns={allCheckIns}
          selectedIds={selectedCheckInIds}
          onConfirm={(ids) => {
            onSelectedChange(ids);
            close();
          }}
          onClose={() => close()}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  const handleStartEditReflection = () => {
    setReflectionDraft(reflectionText);
    setIsEditingReflection(true);
  };

  const handleCancelEditReflection = () => {
    setReflectionDraft(reflectionText);
    setIsEditingReflection(false);
  };

  const handleSaveReflection = async () => {
    const trimmed = reflectionDraft.trim();
    if (!trimmed) return;
    await saveReflection(trimmed);
    onReflectionChange(trimmed);
    setIsEditingReflection(false);
  };

  const handleTogglePublic = async () => {
    const nextPublic = !isPublic;
    setIsTogglingPublic(true);

    const response = await updatePractice(summary.practiceId, {
      privacyStatus: nextPublic ? "public" : "private",
    });

    setIsTogglingPublic(false);

    if (response.error) {
      const errorMessage =
        response.error && typeof response.error === "object" && "message" in response.error
          ? String(response.error.message)
          : "更新公開狀態失敗";
      toast.error(errorMessage);
      return;
    }

    setIsPublic(nextPublic);
    setLinkReady(false);

    if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
    if (nextPublic) {
      linkTimeoutRef.current = setTimeout(() => setLinkReady(true), LINK_GENERATE_DELAY_MS);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      toast.error("複製失敗，請手動選取連結文字");
    }
  };

  return (
    <main className="mx-auto max-w-[448px] px-5 pb-24 pt-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-7 text-center">
        <h1 className="text-xl font-bold text-text-dark">製作分享卡</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-logo-gray">
          調整風格與精選內容，做一張可以分享出去的總結卡。
        </p>
      </section>

      {/* 打卡精選 */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-text-dark">
            <Pencil className="size-[15px] text-logo-cyan" />
            打卡精選
          </h2>
          <button
            type="button"
            onClick={handleOpenPicker}
            className="flex items-center gap-1 text-xs text-logo-cyan"
          >
            <Pencil className="size-3" />
            編輯精選
          </button>
        </div>
        <p className="mb-3 flex items-start gap-1.5 text-xs text-logo-gray">
          <Info className="mt-0.5 size-3.5 shrink-0 text-basic-300" />
          系統根據字數最多的反思自動挑選，你可以換成最有意義的 3 則。
        </p>

        {featuredCheckIns.length === 0 ? (
          <p className="rounded-xl border border-basic-100 bg-white p-4 text-center text-sm text-logo-gray">
            還沒有精選打卡，點擊「編輯精選」開始選擇。
          </p>
        ) : (
          <div className="space-y-2">
            {featuredCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="rounded-xl border border-basic-100 bg-white p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-dark">Day {checkIn.day}</span>
                  <span className="text-xs text-logo-gray">{checkIn.date}</span>
                </div>
                <p className="text-sm leading-relaxed text-logo-gray">{checkIn.note}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 背景色選擇器 */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-[13px] font-medium text-logo-gray">卡片背景</span>
        <div className="flex gap-2">
          {THEME_SWATCHES.map((swatch, index) => (
            <button
              key={SHARE_CARD_THEMES[index]?.name ?? index}
              type="button"
              onClick={() => onThemeChange(index)}
              aria-label={`選擇背景色 ${index + 1}`}
              className={cn(
                "size-8 rounded-[10px] transition-shadow",
                themeIndex === index && "ring-2 ring-logo-cyan ring-offset-2"
              )}
              style={{
                background: swatch.bg,
                border: swatch.border ? `1px solid ${swatch.border}` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* 分享卡預覽 */}
      <div className="mt-4">
        <ShareCardPreview
          ref={summaryCardRef}
          summary={summary}
          reflectionText={reflectionText}
          themeIndex={themeIndex}
        />
      </div>

      {/* 反思內聯編輯 */}
      <section className="mt-4 rounded-2xl border border-basic-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-dark">我的反思</h3>
          {!isEditingReflection && (
            <button
              type="button"
              onClick={handleStartEditReflection}
              className="flex items-center gap-1 text-xs text-logo-cyan"
            >
              <Pencil className="size-3" />
              編輯
            </button>
          )}
        </div>

        {isEditingReflection ? (
          <div className="mt-2.5 space-y-2.5">
            <textarea
              value={reflectionDraft}
              onChange={(event) => setReflectionDraft(event.target.value)}
              rows={3}
              placeholder="這段旅程帶給你什麼樣的體會？"
              className="w-full resize-none rounded-xl border border-basic-200 bg-very-light-gray p-3 text-sm leading-relaxed text-text-dark outline-none focus:border-logo-cyan"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEditReflection}
                disabled={isSavingReflection}
              >
                取消
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveReflection}
                disabled={isSavingReflection || !reflectionDraft.trim()}
              >
                儲存
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm italic leading-relaxed text-text-dark/80">
            {reflectionText.trim() || "（尚未寫下反思）"}
          </p>
        )}
      </section>

      {/* 下載圖片 */}
      <Button
        type="button"
        variant="ctaOrange"
        className="mt-4 w-full gap-2"
        onClick={() => void downloadImage()}
        disabled={isGenerating}
      >
        <Download className="size-4" />
        {isGenerating ? "圖片生成中..." : "下載圖片"}
      </Button>

      {/* 公開此成就頁面 */}
      <section
        className={cn(
          "mt-4 overflow-hidden rounded-2xl border bg-white transition-colors",
          isPublic ? "border-primary-lighter" : "border-basic-200"
        )}
      >
        <div className={cn("flex w-full items-center gap-3 p-4", isTogglingPublic && "opacity-60")}>
          <button
            type="button"
            onClick={() => void handleTogglePublic()}
            disabled={isTogglingPublic}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-very-light-gray">
              {isPublic ? (
                <LockOpen className="size-[17px] text-logo-cyan" />
              ) : (
                <Lock className="size-[17px] text-basic-300" />
              )}
            </span>
            <span className="flex-1 text-sm font-medium text-text-dark">公開此成就頁面</span>
          </button>
          <Switch
            checked={isPublic}
            disabled={isTogglingPublic}
            onCheckedChange={() => void handleTogglePublic()}
          />
        </div>

        {isPublic && (
          <div className="border-t border-primary-lightest bg-primary-palest px-4 pb-4 pt-3.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-[10px] border border-primary-lighter bg-white px-3 py-2 font-mono text-xs text-text-dark">
                {linkReady ? shareUrl : "正在生成連結..."}
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 gap-1"
                disabled={!linkReady}
                onClick={() => void handleCopyLink()}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    複製
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-logo-gray">
              <Info className="mt-0.5 size-3.5 shrink-0 text-basic-300" />
              公開時，訪客會看到你的學習軌跡、打卡精選、和我的反思。
            </p>
          </div>
        )}
      </section>

      {/* 底部導航 */}
      <div className="mt-5 flex gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => onSurfaceChange(1)}
        >
          <Undo2 className="size-3.5" />
          回到總結頁
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5 bg-white"
          onClick={() => onSurfaceChange(2)}
        >
          <ArrowUpRight className="size-3.5" />
          接下來我想
        </Button>
      </div>

      <div className="mt-4 text-center">
        <CustomLink
          href="/practices"
          className="inline-flex items-center gap-1.5 text-xs text-logo-gray underline underline-offset-2"
        >
          <Home className="size-3.5" />
          前往主題實踐列表
        </CustomLink>
      </div>
    </main>
  );
}
