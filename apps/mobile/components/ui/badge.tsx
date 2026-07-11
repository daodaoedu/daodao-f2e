import { styled, XStack } from "tamagui";

/**
 * 專案標準徽章容器。
 *
 * pill 形狀（borderRadius $full）對齊 web packages/ui 的 Badge（rounded-full）。
 * 顏色不寫死 variant——mobile 的狀態徽章顏色多來自動態 statusConfig，故由呼叫端
 * 傳 backgroundColor 並在內層 Text 設 color，這裡只統一形狀與內距。
 *
 * 用法：
 *   <Badge backgroundColor={statusInfo.backgroundColor}>
 *     <Text color={statusInfo.textColor}>{label}</Text>
 *   </Badge>
 */
export const Badge = styled(XStack, {
  name: "DaodaoBadge",
  borderRadius: "$full",
  alignSelf: "flex-start",
  alignItems: "center",
  paddingHorizontal: "$3",
  paddingVertical: "$1",
});

export type BadgeProps = React.ComponentProps<typeof Badge>;
