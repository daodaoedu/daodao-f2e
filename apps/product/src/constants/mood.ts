import type { ElementType } from "react";
import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";

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

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: ElementType;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: MoodType.hopeless, label: "想放棄", emoji: HopelessSvg },
  { id: MoodType.frustrated, label: "受挫", emoji: FrustratedSvg },
  { id: MoodType.bored, label: "無聊", emoji: BoredSvg },
  { id: MoodType.neutral, label: "普通", emoji: NeutralSvg },
  { id: MoodType.fine, label: "還不錯", emoji: FineSvg },
  { id: MoodType.happy, label: "開心", emoji: HappySvg },
];

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
