import { styled, Button as TamaguiButton } from "tamagui";

/**
 * 專案標準按鈕。
 *
 * 是 Tamagui Button 的透明包裝，唯一差異：預設圓角為膠囊（$full），對齊 web
 * packages/ui 的 `rounded-full`。所有 Tamagui Button props（size / chromeless /
 * circular / backgroundColor / onPress …）照舊可用，畫面若自訂 borderRadius 也會
 * 蓋過此預設。
 *
 * 讓「按鈕是膠囊」成為單一來源——日後要調整按鈕形狀只改這一處，而非散落各畫面。
 */
export const Button = styled(TamaguiButton, {
  name: "DaodaoButton",
  borderRadius: "$full",
});

export type ButtonProps = React.ComponentProps<typeof Button>;
