"use client";

// TODO: Replace hardcoded strings with useTranslations("practice") when i18n keys are added
import type { PracticeSummary } from "@daodao/api";
import { TitleSvg } from "@daodao/assets";
import { format, isValid, parse } from "date-fns";
import { Link2 } from "lucide-react";
import { forwardRef } from "react";

interface ShareCardPreviewProps {
  summary: PracticeSummary;
  reflectionText: string;
  themeIndex: number;
}

interface ShareCardTheme {
  name: string;
  bg: string;
  text: string;
  accent: string;
  boxBg: string;
}

/** 分享卡的四種背景主題（依 FRD FR-3.5.5 / FR-3.5.6 定義） */
export const SHARE_CARD_THEMES: readonly ShareCardTheme[] = [
  {
    name: "dark",
    bg: "#0f3036",
    text: "#fff",
    accent: "rgba(255,255,255,.55)",
    boxBg: "rgba(22,185,179,.18)",
  },
  {
    name: "light",
    bg: "#f4f6f6",
    // 以下為 --text-dark / --basic-400 / --primary-lightest 的 hex 換算值：
    // html2canvas 擷取分享卡圖片時無法解析 CSS 變數（oklch），需改用字面色值
    text: "#295e5c", // was var(--text-dark)
    accent: "#536166", // was var(--basic-400)
    boxBg: "#def5f5", // was var(--primary-lightest)
  },
  {
    name: "cyan",
    bg: "#16b9b3",
    text: "#fff",
    accent: "rgba(255,255,255,.7)",
    boxBg: "rgba(255,255,255,.18)",
  },
  {
    name: "yellow",
    bg: "#f9e41c",
    text: "#295e5c", // was var(--text-dark)
    accent: "#536166", // was var(--basic-400)
    boxBg: "rgba(0,0,0,.08)",
  },
] as const;

/** 預設主題（陣列存取結果為 undefined 時的保底值，陣列固定 4 筆，第一筆必定存在） */
const DEFAULT_SHARE_CARD_THEME = SHARE_CARD_THEMES[0] as ShareCardTheme;

/** 將 YYYY-MM-DD 格式的日期字串格式化為 yyyy/MM/dd，解析失敗時原樣顯示 */
function formatSummaryDate(dateStr: string): string {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return dateStr;
  return format(date, "yyyy/MM/dd");
}

/** 計算實踐總天數（含頭尾），解析失敗時回傳 null */
function getDurationDays(startDate: string, endDate: string): number | null {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const end = parse(endDate, "yyyy-MM-dd", new Date());
  if (!isValid(start) || !isValid(end)) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * 分享卡預覽
 * @description 可被擷取為圖片的總結卡片，依 themeIndex 套用背景色與文字配色
 */
export const ShareCardPreview = forwardRef<HTMLDivElement, ShareCardPreviewProps>(
  ({ summary, reflectionText, themeIndex }, ref) => {
    const theme = SHARE_CARD_THEMES[themeIndex] ?? DEFAULT_SHARE_CARD_THEME;
    const durationDays = getDurationDays(summary.startDate, summary.endDate);
    const displayReflection = reflectionText.trim() || "（尚未寫下反思）";

    return (
      <div
        ref={ref}
        className="relative mx-auto aspect-3/4 w-full max-w-[400px] overflow-hidden rounded-[20px] p-6"
        style={{ background: theme.bg, color: theme.text }}
      >
        {/* 裝飾圓 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-4 size-[70px] rounded-full"
          style={{ background: theme.boxBg }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 -left-2.5 size-[85px] rounded-full"
          style={{ background: theme.boxBg }}
        />

        <div className="relative z-10 flex h-full flex-col">
          {/* 品牌 + 使用者名稱 */}
          <div className="mb-5 flex items-center gap-2">
            <TitleSvg className="size-6 shrink-0" />
            <span className="text-[13px] font-medium" style={{ color: theme.text }}>
              {summary.userName}
            </span>
          </div>

          {/* 實踐標題 */}
          <h2 className="mb-1.5 text-xl font-semibold leading-snug">{summary.practiceName}</h2>

          {/* 時間區間 + 天數 pill */}
          <div className="mb-4.5 flex items-center gap-2">
            <span className="text-[13px]" style={{ color: theme.accent }}>
              {formatSummaryDate(summary.startDate)} — {formatSummaryDate(summary.endDate)}
            </span>
            {durationDays !== null && (
              <span
                className="rounded-full px-3 py-0.5 text-xs font-medium"
                style={{ color: theme.accent, background: theme.boxBg }}
              >
                {durationDays} 天
              </span>
            )}
          </div>

          <div aria-hidden="true" className="mb-4.5 h-px" style={{ background: theme.boxBg }} />

          {/* 實踐行動 */}
          {summary.practiceDescription && (
            <div className="mb-4.5">
              <p className="mb-1 text-xs" style={{ color: theme.accent }}>
                實踐行動
              </p>
              <p className="text-sm leading-relaxed">{summary.practiceDescription}</p>
            </div>
          )}

          {/* 我的反思 */}
          <div className="mb-5 rounded-xl px-4 py-3.5" style={{ background: theme.boxBg }}>
            <p className="mb-1 text-xs font-medium" style={{ color: theme.accent }}>
              我的反思
            </p>
            <p className="text-sm italic leading-relaxed">{displayReflection}</p>
          </div>

          <div
            className="mt-auto flex items-center justify-end gap-1.5 text-xs"
            style={{ color: theme.accent }}
          >
            <Link2 className="size-3.5" />
            <span>daodao.so/@{summary.userName}</span>
          </div>
        </div>
      </div>
    );
  }
);

ShareCardPreview.displayName = "ShareCardPreview";
