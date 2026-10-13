"use client";

import { selectChatMembers, useChatMembers } from "@daodao/api";
import { GroupSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { useIsMobile } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft, Pin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChatRoomCover } from "@/constants/chat";
import { ChatAvatar } from "./chat-avatar";

interface ChatHeaderProps {
  roomId: number;
  name: string;
  memberCount: number;
  colorSeed: number;
  pinnedCount?: number;
  /** 置頂 banner 是否顯示中（POC：顯示時置頂鈕為黃底） */
  pinnedHighlighted?: boolean;
  membersOpen?: boolean;
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  onToggleMembers?: () => void;
  onTogglePins?: () => void;
}

const ROUND_BUTTON =
  "size-8 shrink-0 rounded-full border text-[oklch(0.445_0.056_192)] hover:text-[oklch(0.445_0.056_192)] [&_svg]:size-4";

/** 聊天室標頭（POC 訊息.dc.html）：房間圖示、房名、成員頭像堆疊＋人數、搜尋、置頂 */
export function ChatHeader({
  roomId,
  name,
  memberCount,
  colorSeed,
  pinnedCount = 0,
  pinnedHighlighted = false,
  membersOpen = false,
  searchOpen = false,
  onToggleSearch,
  onToggleMembers,
  onTogglePins,
}: ChatHeaderProps) {
  const t = useTranslations("messages");
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: membersData } = useChatMembers(roomId);
  const previewMembers = selectChatMembers(membersData).slice(0, 3);

  return (
    <header
      data-chat-header
      className="sticky top-0 z-20 flex shrink-0 items-center gap-3.5 border-b border-[#E4EAE9] bg-white/[0.92] px-7 py-4 backdrop-blur-[12px]"
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/messages")}
          className="-ml-3 size-9 shrink-0"
          aria-label={t("room_header_back")}
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}

      <span
        data-chat-room-icon
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          getChatRoomCover(colorSeed)
        )}
      >
        <GroupSvg className="size-[22px]" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="m-0 truncate text-[17px] font-semibold text-[oklch(0.287_0.041_210.8)]">
          {name}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onToggleMembers && (
          <Button
            variant="ghost"
            onClick={onToggleMembers}
            aria-label={t("view_members")}
            aria-pressed={membersOpen}
            data-chat-members-button
            className={cn(
              "h-10 shrink-0 gap-0 whitespace-nowrap rounded-full border py-0 pr-3 pl-1.5",
              membersOpen
                ? "border-[oklch(0.711_0.12_190.6)] bg-[oklch(0.962_0.032_211.1)]"
                : "border-transparent bg-transparent"
            )}
          >
            {previewMembers.map((m, i) => (
              <ChatAvatar
                key={m.userId}
                src={m.avatar}
                alt={m.nickname ?? ""}
                className={cn("size-[22px] shadow-[0_0_0_2px_#fff]", i > 0 && "-ml-[7px]")}
              />
            ))}
            <span className="ml-2 text-[13px] leading-[1.45] font-normal text-[oklch(0.445_0.056_192)]">
              {memberCount}
            </span>
          </Button>
        )}
        {onToggleSearch && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSearch}
            aria-label={t("search_messages")}
            title={t("search_messages")}
            className={cn(
              ROUND_BUTTON,
              "border-[#E4EAE9]",
              searchOpen ? "bg-[oklch(0.962_0.032_211.1)]" : "bg-white"
            )}
          >
            <Search />
          </Button>
        )}
        {pinnedCount > 0 && onTogglePins && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePins}
            aria-label={t("pin_panel_title")}
            title={t("pin_panel_title")}
            className={cn(
              ROUND_BUTTON,
              pinnedHighlighted
                ? "border-[oklch(0.786_0.17_68.2/0.5)] bg-[oklch(0.908_0.186_102.5/0.3)]"
                : "border-[#E4EAE9] bg-white"
            )}
          >
            <Pin />
          </Button>
        )}
      </div>
    </header>
  );
}
