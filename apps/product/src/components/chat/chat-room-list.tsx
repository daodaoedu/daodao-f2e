"use client";

import { type ChatRoomType, selectChatRoomList, useMyChatRooms } from "@daodao/api";
import { GroupSvg } from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronLeft, Search, X } from "lucide-react";
import { useState } from "react";
import { getChatRoomCover } from "@/constants/chat";
import { chatRoomPreview, chatRoomTimeLabel } from "@/utils/chat-format";

// ============================================================================
// Room Item（POC 訊息.dc.html：圓形圖示、房名＋時間、最後一則預覽＋未讀數）
// ============================================================================

interface ChatRoomItemProps {
  room: ChatRoomType;
  locale: string;
  now: string;
  isActive: boolean;
}

function ChatRoomItem({ room, locale, now, isActive }: ChatRoomItemProps) {
  const t = useTranslations("messages");

  const preview = chatRoomPreview(room.lastMessage);
  const previewText =
    preview.kind === "mine"
      ? t("last_message_mine", { body: preview.body })
      : preview.kind === "other"
        ? t("last_message_other", { name: preview.name, body: preview.body })
        : preview.kind === "plain"
          ? preview.body
          : "";

  const time = chatRoomTimeLabel(room.lastMessage?.createdAt ?? room.lastActivityAt, now, locale);
  const timeText =
    time.kind === "just_now"
      ? t("room_time_just_now")
      : time.kind === "yesterday"
        ? t("date_yesterday")
        : time.value;

  return (
    <Link
      href={`/messages/${room.id}`}
      data-chat-room-row={room.id}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors",
        isActive ? "bg-[oklch(0.962_0.032_211.1)]" : "bg-transparent hover:bg-[#F0F9F8]"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          getChatRoomCover(room.colorSeed)
        )}
      >
        <GroupSvg className="size-5" aria-hidden />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex items-baseline gap-1.5">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[oklch(0.287_0.041_210.8)]">
            {room.name}
          </span>
          <span className="shrink-0 text-[11px] text-[oklch(0.445_0.056_192/0.45)]">
            {timeText}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-xs text-[oklch(0.445_0.056_192/0.6)]">
            {previewText}
          </span>
          {room.unreadCount > 0 && !isActive && (
            <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[oklch(0.706_0.197_45.6)] px-[5px] text-[11px] leading-none font-semibold text-white">
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

function ChatRoomSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3">
      <div className="size-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

// ============================================================================
// Main
// ============================================================================

interface ChatRoomListProps {
  activeRoomId?: number;
}

export function ChatRoomList({ activeRoomId }: ChatRoomListProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const { data, isLoading } = useMyChatRooms();
  const [filter, setFilter] = useState("");
  const now = new Date().toISOString();

  const { items: rooms } = selectChatRoomList(data);

  const filtered = filter
    ? rooms.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    : rooms;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title area：返回、標題、搜尋 */}
      <div data-chat-room-list-head className="shrink-0 px-5 pt-6 pb-3">
        {/* POC：返回「空間」頁 */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="mb-2.5 -ml-1.5 size-[30px] rounded-full text-[oklch(0.711_0.12_190.6)] hover:bg-[#F0F9F8] hover:text-[oklch(0.445_0.056_192)] [&_svg]:size-[18px]"
        >
          <Link href="/spaces" aria-label={t("room_header_back")}>
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="mt-0 mb-3 text-xl font-bold text-[oklch(0.287_0.041_210.8)]">
          {t("title")}
        </h1>
        <div className="flex items-center gap-2 rounded-[12px] border border-[#E4EAE9] bg-[oklch(0.992_0.011_182.9)] px-3 py-2">
          <Search className="size-[15px] shrink-0 text-[oklch(0.445_0.056_192/0.4)]" aria-hidden />
          <Input
            placeholder={t("filter_placeholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label={t("filter_placeholder")}
            className="h-[21px] min-w-0 flex-1 rounded-none border-0 bg-transparent px-[2px] py-0 text-[13px] text-[oklch(0.287_0.041_210.8)] placeholder:text-[oklch(0.445_0.056_192/0.4)] hover:border-0 focus-visible:border-0 focus-visible:px-[2px] focus-visible:py-0focus-visible:ring-0"
          />
          {filter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilter("")}
              aria-label={t("filter_clear")}
              className="size-5 shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.5)] hover:bg-[oklch(0.962_0.032_211.1)] [&_svg]:size-[13px]"
            >
              <X />
            </Button>
          )}
        </div>
      </div>

      {/* Room List */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2 pb-5">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <ChatRoomSkeleton key={i} />
          ))
        ) : rooms.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-[oklch(0.445_0.056_192/0.5)]">
            <p className="text-base">{t("empty")}</p>
            <p className="mt-1 text-sm">{t("empty_description")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="mx-3 my-[22px] text-[13px] leading-[1.7] text-[oklch(0.445_0.056_192/0.5)]">
            {t("filter_no_results")}
          </p>
        ) : (
          filtered.map((room) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              locale={locale}
              now={now}
              isActive={room.id === activeRoomId}
            />
          ))
        )}
      </div>
    </div>
  );
}
