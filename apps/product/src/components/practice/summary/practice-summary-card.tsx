"use client";

import type { MoodType, PracticeSummary } from "@daodao/api";
import {
  BgRadialSvg,
  BoredSvg,
  EllipseSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
  StarSvg,
  TitleSvg,
  VectorHalfBlueSvg,
  VectorSvg,
} from "@daodao/assets";
// MascotBasicSvg 不在 barrel 匯出（檔案過大且 mobile 未使用），改用 path import
import MascotBasicSvg from "@daodao/assets/images/icon/mascot-basic.svg";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { type ComponentType, forwardRef } from "react";

interface PracticeSummaryCardProps {
  summary: PracticeSummary;
  className?: string;
}

/**
 * 心情類型對應的 SVG 組件
 */
const MoodIconMap: Record<MoodType, ComponentType<{ className?: string }>> = {
  give_up: HopelessSvg,
  frustrated: FrustratedSvg,
  bored: BoredSvg,
  neutral: NeutralSvg,
  good: FineSvg,
  happy: HappySvg,
};

/**
 * 泡泡顏色配置（正圓形）
 */
const BUBBLE_COLORS = {
  yellow: "bg-[#FCDD84]", // 黃色（足跡半圓、標籤泡泡）
  white: "bg-white", // 白色（標籤泡泡）
  cyan: "bg-[#A8E0E0]", // 淺藍色（標籤泡泡、心情分享）
  lightBlue: "bg-[#D4EEF4]", // 淺藍色（心情分享）
};

/**
 * 實踐完成摘要卡片元件
 * @description 可生成為圖片的摘要卡片，用於分享到社群媒體
 */
export const PracticeSummaryCard = forwardRef<HTMLDivElement, PracticeSummaryCardProps>(
  ({ summary, className }, ref) => {
    const t = useTranslations("practice");
    // 格式化日期顯示
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-[#F4F6F6]",
          "w-[350px] aspect-9/16 mx-auto",
          className
        )}
      >
        {/* 放射狀背景 - 白色放射線，位置偏上 */}
        <div className="absolute -top-[5%] left-0 right-0 flex items-center justify-center">
          <BgRadialSvg className="w-full h-auto" />
        </div>

        {/* 右上角裝飾：吉祥物 + 黃色星星 */}
        <div className="absolute top-4 right-4">
          <MascotBasicSvg className="w-20 h-20" />
        </div>
        <div className="absolute top-28 right-6">
          <StarSvg className="w-5 h-5 text-yellow-400" />
        </div>

        {/* 卡片內容 */}
        <div className="relative h-full flex flex-col p-6 pb-0">
          {/* 用戶名稱 */}
          <div className="text-logo-cyan font-medium text-lg mb-1">{summary.userName}</div>

          {/* 實踐期間 */}
          <div className="text-sm mb-3">
            <span className="text-text-gray">{t("summary_card_from")} </span>
            <span className="text-logo-cyan">{formatDate(summary.startDate)}</span>
            <span className="text-text-gray"> {t("summary_card_to")} </span>
            <span className="text-logo-cyan">{formatDate(summary.endDate)}</span>
            <span className="text-text-gray"> {t("summary_card_practiced")}</span>
          </div>

          {/* 實踐標題 */}
          <h2 className="font-inter text-xl font-semibold text-text-dark leading-5 tracking-normal mb-2 pr-20">
            {summary.practiceName}
          </h2>

          {/* 實踐描述 - 白色圓角框 */}
          {summary.practiceDescription && (
            <div className="bg-white rounded-lg p-2.5 mb-4 w-[262px] min-h-[68px]">
              <p className="text-sm text-text-dark line-clamp-3">{summary.practiceDescription}</p>
            </div>
          )}

          {/* 統計與泡泡區塊 */}
          <div className="flex-1 relative">
            {/* 黃色上半圓 - 成長足跡 */}
            <div className="absolute -left-[70px] top-0 w-[300px] h-[111px]">
              <VectorSvg className="absolute inset-0 w-full h-full" />
              <div className="relative pl-20 pt-6">
                <div className="text-sm text-text-dark">{t("summary_card_footprint")}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text-dark">{summary.checkInCount}</span>
                  <span className="text-base text-text-dark">
                    {t("summary_card_footprint_count")}
                  </span>
                </div>
              </div>
            </div>

            {/* 淺藍色小半圓 - 黃色半圓下方 */}
            <VectorHalfBlueSvg className="absolute left-[100px] top-[90px] w-[80px] h-[40px]" />

            {/* 過程心情 - 右上 */}
            {summary.topMoods.length > 0 && (
              <div className="absolute right-2 top-0">
                <div className="text-sm text-text-dark mb-2">{t("summary_card_mood")}</div>
                <div className="relative">
                  {summary.topMoods.map((moodStat, index) => {
                    const MoodIcon = MoodIconMap[moodStat.mood];
                    return index === 0 ? (
                      <MoodIcon key={moodStat.mood} className="w-14 h-14 relative z-10" />
                    ) : (
                      <MoodIcon
                        key={moodStat.mood}
                        className="w-10 h-10 absolute -top-1 -right-4 z-0"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 第一個標籤 - 左側（灰色） */}
            {summary.topNotes[0] && (
              <div
                className={cn(
                  "absolute -left-10 top-40 rounded-full flex items-center justify-center p-4",
                  "w-[140px] h-[140px]",
                  "bg-[#E4EAE9]"
                )}
              >
                <span className="text-sm text-text-dark text-center leading-tight line-clamp-4 rotate-15">
                  {summary.topNotes[0]}
                </span>
              </div>
            )}

            {/* 心情分享 - 中間偏上小圓 */}
            <TitleSvg className="absolute left-1/2 -translate-x-1/2 top-[160px] w-[85px] h-[85px] z-20" />

            {/* 第二個標籤 - 右側（淺藍色，最大） */}
            {summary.topNotes[1] && (
              <div
                className={cn(
                  "absolute -right-10 top-40 rounded-full flex items-center justify-center p-5",
                  "w-[180px] h-[180px]",
                  "bg-[#99ECFF]"
                )}
              >
                <span className="text-sm text-text-dark text-center leading-tight line-clamp-5 -rotate-15">
                  {summary.topNotes[1]}
                </span>
              </div>
            )}

            {/* 第三個標籤 - 中間下方（白色） */}
            {summary.topNotes[2] && (
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 -bottom-6 rounded-full flex items-center justify-center p-4",
                  "w-[130px] h-[130px]",
                  BUBBLE_COLORS.white
                )}
              >
                <span className="text-sm text-text-dark text-center leading-tight line-clamp-4">
                  {summary.topNotes[2]}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between -mx-6 px-6 py-3 border-t border-gray-100 mt-auto">
            <span className="text-xs text-text-dark">daodao.so</span>
            <span className="text-xs text-text-dark">{t("summary_card_footer")}</span>
          </div>
        </div>

        {/* 左下角裝飾圓 - 淺藍綠色半透明 */}
        <EllipseSvg className="absolute -left-[5px] bottom-0 w-[117px] h-[92px]" />
      </div>
    );
  }
);

PracticeSummaryCard.displayName = "PracticeSummaryCard";
