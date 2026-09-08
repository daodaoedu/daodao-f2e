"use client";

import { cn } from "@daodao/ui/lib/utils";
import { useIsMobile } from "@daodao/shared";
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
    <div className="flex h-[calc(100dvh-68px)] md:h-dvh overflow-hidden">
      {showList && (
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-white/50",
            isMobile ? "w-full" : "w-[288px] shrink-0",
          )}
        >
          <ChatRoomList activeRoomId={roomId} />
        </aside>
      )}
      {showConversation && (
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      )}
    </div>
  );
}
