// Deterministic avatar background colors for persona answers without a photo.
export const AVATAR_COLORS = [
  "#F5A93E",
  "#16B9B3",
  "#9B8FE0",
  "#5BA58C",
  "#E07B7B",
  "#F5C842",
  "#7BB8E0",
] as const;

export function getAvatarColor(displayName: string, isSelf = false): string {
  if (isSelf) return "#16B9B3";
  const colorIndex =
    displayName.split("").reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex] ?? "#16B9B3";
}
