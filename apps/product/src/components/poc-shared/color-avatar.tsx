"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { cn } from "@daodao/ui/lib/utils";

/** 設計稿的頭像色系（青綠 / 橘 / 金黃 / 草綠 / 磚橘） */
const AVATAR_COLORS = [
  { bg: "#16B9B3", text: "#FFFFFF" },
  { bg: "#FFA10B", text: "#FFFFFF" },
  { bg: "#F0D020", text: "#7A5C00" },
  { bg: "#AFD24B", text: "#4A5D14" },
  { bg: "#E86B2A", text: "#FFFFFF" },
] as const;

function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
}

interface ColorAvatarProps {
  name: string;
  photoURL?: string;
  className?: string;
}

/** POC 用彩色首字頭像：有照片顯示照片，否則以名字雜湊取品牌色 */
export function ColorAvatar({ name, photoURL, className }: ColorAvatarProps) {
  const color = colorFor(name);
  return (
    <Avatar className={cn("size-10", className)}>
      {photoURL && <AvatarImage src={photoURL} alt={name} />}
      <AvatarFallback
        className="text-sm font-medium"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
