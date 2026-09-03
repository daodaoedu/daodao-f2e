"use client";

import { useMyChatRooms } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { useLocale } from "@daodao/i18n";
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
}

function ChatRoomItem({ room, locale }: ChatRoomItemProps) {
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
      className="flex items-center gap-3 rounded-xl bg-white p-3 hover:bg-gray-50 transition-colors"
    >
      {/* Room Icon */}
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-text-dark",
          getRoomColor(room.colorSeed)
        )}
      >
        {room.iconLabel}
      </div>

      {/* Text Content */}
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

      {/* Unread Badge */}
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

export function ChatRoomList() {
  const t = useTranslations("messages");
  const locale = useLocale();
  const { data, isLoading } = useMyChatRooms();

  const rooms = data?.items ?? [];
  const totalUnread = data?.totalUnread ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <ChatRoomSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-dark/50">
        <p className="text-base">{t("empty")}</p>
        <p className="text-sm mt-1">{t("empty_description")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Total Unread Header */}
      {totalUnread > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="alert" size="sm">
            {t("total_unread", { count: totalUnread })}
          </Badge>
        </div>
      )}

      {/* Room List */}
      <div className="flex flex-col gap-1">
        {rooms.map((room) => (
          <ChatRoomItem key={room.id} room={room} locale={locale} />
        ))}
      </div>
    </div>
  );
}
