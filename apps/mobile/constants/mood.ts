import BoredSvg from "@daodao/assets/images/emotion/bored.svg";
import FineSvg from "@daodao/assets/images/emotion/fine.svg";
import FrustratedSvg from "@daodao/assets/images/emotion/frustrated.svg";
import HappySvg from "@daodao/assets/images/emotion/happy.svg";
import HopelessSvg from "@daodao/assets/images/emotion/hopeless.svg";
import NeutralSvg from "@daodao/assets/images/emotion/neutral.svg";
import type { ComponentType } from "react";

/**
 * 心情類型運行時常數
 */
export const MoodType = {
  hopeless: "hopeless",
  frustrated: "frustrated",
  bored: "bored",
  neutral: "neutral",
  fine: "fine",
  happy: "happy",
} as const;

/**
 * 心情類型
 */
export type MoodType = (typeof MoodType)[keyof typeof MoodType];

export interface IMoodOption {
  id: MoodType;
  label: string;
  labelKey: string;
  emoji: string;
}

export const MOOD_OPTIONS: IMoodOption[] = [
  { id: MoodType.hopeless, label: "想放棄", labelKey: "mood_hopeless", emoji: "😞" },
  { id: MoodType.frustrated, label: "受挫", labelKey: "mood_frustrated", emoji: "😤" },
  { id: MoodType.bored, label: "無聊", labelKey: "mood_bored", emoji: "😐" },
  { id: MoodType.neutral, label: "普通", labelKey: "mood_neutral", emoji: "😶" },
  { id: MoodType.fine, label: "還不錯", labelKey: "mood_fine", emoji: "🙂" },
  { id: MoodType.happy, label: "開心", labelKey: "mood_happy", emoji: "😊" },
];

/**
 * 心情插畫 SVG 映射（對齊 apps/product 用 @daodao/assets 的心情圖）。
 * 保留 MOOD_OPTIONS.emoji 原生字串供其他用途，此處提供 SVG 版給需與 product 對齊的卡片。
 */
export const MOOD_EMOJI_SVG: Record<
  MoodType,
  ComponentType<{ width?: number; height?: number; color?: string }>
> = {
  hopeless: HopelessSvg,
  frustrated: FrustratedSvg,
  bored: BoredSvg,
  neutral: NeutralSvg,
  fine: FineSvg,
  happy: HappySvg,
};

/**
 * API mood 值類型
 */
export type ApiMoodType = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

/**
 * API mood 值到前端 MoodType 的映射
 */
export const ApiMoodToMoodTypeMap: Record<ApiMoodType, MoodType> = {
  give_up: MoodType.hopeless,
  frustrated: MoodType.frustrated,
  bored: MoodType.bored,
  neutral: MoodType.neutral,
  good: MoodType.fine,
  happy: MoodType.happy,
} as const;

/**
 * 前端 MoodType 到 API mood 值的映射
 */
export const MoodTypeToApiMoodMap: Record<MoodType, ApiMoodType> = {
  hopeless: "give_up",
  frustrated: "frustrated",
  bored: "bored",
  neutral: "neutral",
  fine: "good",
  happy: "happy",
} as const;

/**
 * 將 API 的 mood 值映射到前端的 MoodType
 */
export const mapApiMoodToMoodType = (apiMood: ApiMoodType | undefined): MoodType | null => {
  if (!apiMood) {
    return null;
  }

  return ApiMoodToMoodTypeMap[apiMood] ?? null;
};

/**
 * 將前端的 MoodType 映射到 API 的 mood 值
 */
export const mapMoodTypeToApiMood = (mood: MoodType | null): ApiMoodType | undefined => {
  if (!mood) {
    return undefined;
  }

  return MoodTypeToApiMoodMap[mood];
};
