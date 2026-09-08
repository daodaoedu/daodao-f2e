"use client";

import { useMyChatRooms } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { formatRelativeTime } from "@/utils/format-time";

// ============================================================================
// Helpers
// ============================================================================

const ROOM_COLORS = [
  "bg-[#FFD6C8]",
  "bg-[#C8FFE4]",
  "bg-[#C8DCFF]",
  "bg-[#FFC8F0]",
  "bg-[#FEFFC8]",
  "bg-[#C8FFF2]",
  "bg-[#E4C8FF]",
  "bg-[#FFE4C8]",
  "bg-[#C8F0FF]",
];

function getRoomColor(colorSeed: number): string {
  return ROOM_COLORS[colorSeed % ROOM_COLORS.length] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// Room Item
// ============================================================================

interface ChatRoomItemProps {
  room: {
    id: number;
    name: string;
    iconLabel: string;
    colorSeed: number;
    organizationName: string;
    unreadCount: number;
    lastMessage: {
      id: number;
      kind: string;
      bodyPreview: string;
      authorName: string | null;
      isMine: boolean;
      createdAt: string;
    } | null;
    lastActivityAt: string;
  };
  locale: string;
  isActive: boolean;
}

function ChatRoomItem({ room, locale, isActive }: ChatRoomItemProps) {
  const t = useTranslations("messages");

  const lastMessagePreview = room.lastMessage
    ? room.lastMessage.isMine
      ? t("last_message_mine", { body: room.lastMessage.bodyPreview })
      : room.lastMessage.authorName
        ? `${room.lastMessage.authorName}：${room.lastMessage.bodyPreview}`
        : room.lastMessage.bodyPreview
    : null;

  const timeDisplay = room.lastMessage
    ? formatRelativeTime(room.lastMessage.createdAt, locale)
    : formatRelativeTime(room.lastActivityAt, locale);

  return (
    <Link
      href={`/messages/${room.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-colors",
        isActive ? "bg-logo-cyan/10 ring-1 ring-logo-cyan/30" : "bg-white hover:bg-gray-50"
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-text-dark",
          getRoomColor(room.colorSeed)
        )}
      >
        {room.iconLabel}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-dark truncate">{room.name}</h3>
          <span className="text-xs text-text-dark/50 shrink-0">{timeDisplay}</span>
        </div>
        <p className="text-xs text-text-dark/60 truncate">{room.organizationName}</p>
        {lastMessagePreview && (
          <p className="text-sm text-text-dark/70 truncate mt-0.5">{lastMessagePreview}</p>
        )}
      </div>

      {room.unreadCount > 0 && (
        <Badge variant="alert" size="xs" className="shrink-0 min-w-[20px] text-center">
          {room.unreadCount > 99 ? "99+" : room.unreadCount}
        </Badge>
      )}
    </Link>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

function ChatRoomSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3">
      <div className="size-12 shrink-0 rounded-full bg-gray-100 animate-pulse" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-gray-100 animate-pulse" />
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

  const rooms = data?.items ?? [];
  const totalUnread = data?.totalUnread ?? 0;

  const filtered = filter
    ? rooms.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    : rooms;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <ChatRoomSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-text-dark/50 px-4">
        <p className="text-base">{t("empty")}</p>
        <p className="text-sm mt-1">{t("empty_description")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header: title + unread count */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-text-dark">{t("title")}</h2>
        {totalUnread > 0 && (
          <Badge variant="alert" size="sm">
            {t("total_unread", { count: totalUnread })}
          </Badge>
        )}
      </div>

      {/* Filter */}
      <div className="px-4 pb-2">
        <Input
          placeholder={t("filter_placeholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-dark/50 text-center py-8">{t("filter_no_results")}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                locale={locale}
                isActive={room.id === activeRoomId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
