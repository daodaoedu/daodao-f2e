"use client";

import { DefaultAvatarSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { cn } from "@daodao/ui/lib/utils";

interface ChatAvatarProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/** 聊天室頭像：有照片用照片，沒有就用 POC 的 default-avatar（@daodao/ui Avatar 組合） */
export function ChatAvatar({ src, alt, className }: ChatAvatarProps) {
  return (
    <Avatar className={cn("size-8 shrink-0 rounded-full", className)}>
      {src && <AvatarImage src={src} alt={alt} className="object-cover" />}
      <AvatarFallback className="bg-transparent" aria-label={src ? undefined : alt}>
        <DefaultAvatarSvg className="size-full" />
      </AvatarFallback>
    </Avatar>
  );
}
