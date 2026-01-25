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
  emoji: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: MoodType.hopeless, label: "想放棄", emoji: HopelessSvg },
  { id: MoodType.frustrated, label: "受挫", emoji: FrustratedSvg },
  { id: MoodType.bored, label: "無聊", emoji: BoredSvg },
  { id: MoodType.neutral, label: "普通", emoji: NeutralSvg },
  { id: MoodType.fine, label: "還不錯", emoji: FineSvg },
  { id: MoodType.happy, label: "開心", emoji: HappySvg },
];
