import LottieView from "lottie-react-native";
import { Text } from "tamagui";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";

interface LottieEmojiProps {
  type: ReactionTypeType;
  size?: number;
  /** 是否播放動畫；false 時顯示靜態首幀（用於小型堆疊，省效能） */
  play?: boolean;
}

/**
 * 動態 Noto 表情（對齊 product 的 LottieEmoji）。
 * 以 lottie-react-native 載入 Google Noto 的 lottie JSON；無 URL 時 fallback 到靜態 emoji。
 */
export function LottieEmoji({ type, size = 24, play = true }: LottieEmojiProps) {
  const config = REACTION_CONFIG[type];

  if (!config?.lottieUrl) {
    return <Text fontSize={size * 0.85}>{config?.emoji ?? "👍"}</Text>;
  }

  return (
    <LottieView
      source={{ uri: config.lottieUrl }}
      autoPlay={play}
      loop={play}
      style={{ width: size, height: size }}
    />
  );
}
