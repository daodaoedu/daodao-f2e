"use client";

import { useIsMobile } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { ChatRoomList } from "./chat-room-list";

interface ChatLayoutProps {
  roomId?: number;
  children?: React.ReactNode;
}

export function ChatLayout({ roomId, children }: ChatLayoutProps) {
  const isMobile = useIsMobile();
  const showList = isMobile ? !roomId : true;
  const showConversation = isMobile ? !!roomId : true;

  return (
    // 手機版：上方留 68px 給固定的 app logo（全站慣例 pt-[68px]），否則返回鈕會被 logo 蓋住
    <div className="flex h-[calc(100dvh-68px)] overflow-hidden pt-[68px] md:h-dvh md:pt-0">
      {showList && (
        <aside
          className={cn(
            "flex flex-col border-r border-[#E4EAE9] bg-white",
            isMobile ? "w-full" : "w-[288px] shrink-0"
          )}
        >
          <ChatRoomList activeRoomId={roomId} />
        </aside>
      )}
      {showConversation && <main className="flex-1 flex flex-col min-w-0">{children}</main>}
    </div>
  );
}
