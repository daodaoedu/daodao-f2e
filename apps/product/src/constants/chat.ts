export const ChatRoomColors = [
  "hsl(210, 70%, 75%)",
  "hsl(340, 70%, 75%)",
  "hsl(160, 60%, 70%)",
  "hsl(30, 80%, 75%)",
  "hsl(270, 60%, 75%)",
  "hsl(190, 70%, 70%)",
  "hsl(50, 80%, 75%)",
  "hsl(0, 70%, 75%)",
  "hsl(120, 50%, 70%)",
  "hsl(230, 60%, 75%)",
] as const;

export const getChatRoomColor = (colorSeed: number): string =>
  ChatRoomColors[colorSeed % ChatRoomColors.length] ?? ChatRoomColors[0];

export const CHAT_GROUP_GAP_MS = 5 * 60 * 1000;
