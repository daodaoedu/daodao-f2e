import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";

export type MoodType = "hopeless" | "frustrated" | "bored" | "neutral" | "fine" | "happy";

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "hopeless", label: "想放棄", emoji: HopelessSvg },
  { id: "frustrated", label: "受挫", emoji: FrustratedSvg },
  { id: "bored", label: "無聊", emoji: BoredSvg },
  { id: "neutral", label: "普通", emoji: NeutralSvg },
  { id: "fine", label: "還不錯", emoji: FineSvg },
  { id: "happy", label: "開心", emoji: HappySvg },
];
