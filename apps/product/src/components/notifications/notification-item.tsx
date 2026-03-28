"use client";

import { ArrowRightOutlineSvg, MoreSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { cn } from "@daodao/ui/lib/utils";
import { Check, X } from "lucide-react";
import type React from "react";
import type { NotificationTypeType } from "@/constants/notification-type";
import { NotificationType } from "@/constants/notification-type";

// ============================================================================
// Types
// ============================================================================

export interface INotificationActor {
  id?: string;
  name: string;
  photoURL?: string;
}

export interface INotificationPractice {
  id: string;
  name: string;
}

export interface INotificationData {
  id: string;
  type: NotificationTypeType;
  actor: INotificationActor;
  practice?: INotificationPractice;
  /** 留言內容或打卡內容 */
  content?: string;
  /** 反應 emoji */
  reaction?: string;
  /** 連結初衷（connect 類型專用） */
  connectMessage?: string;
  /** 聚合計數（多人互動） */
  aggregationCount?: number;
  time: string;
  isRead: boolean;
  /** 快速操作用的 connectionRequestId */
  connectionRequestId?: string;
  /** 快速操作用的 buddyRequestId */
  buddyRequestId?: string;
}

export interface NotificationItemProps {
  notification: INotificationData;
  onConnectAgree?: (id: string) => void;
  onConnectReject?: (id: string) => void;
  onClick?: (notification: INotificationData) => void;
}

// ============================================================================
// Helper: avatar color
// ============================================================================

const AVATAR_COLORS = [
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

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// Helper: notification text
// ============================================================================

function NotificationText({ notification }: { notification: INotificationData }) {
  const { type, actor, practice, content, reaction, connectMessage, aggregationCount } =
    notification;
  const count = aggregationCount ?? 1;
  const name = <span className="font-semibold">{actor.name}</span>;
  const suffix =
    count > 1 ? <span className="text-text-dark/60">與其他 {count - 1} 人</span> : null;
  const practiceName = practice ? <span className="font-semibold">「{practice.name}」</span> : null;

  if (type === NotificationType.reaction) {
    return (
      <p className="text-sm leading-5 line-clamp-2">
        {name}
        {suffix && <> {suffix}</>} 對你的主題實踐{practiceName}給了反應：{reaction ?? "🙌"}
      </p>
    );
  }

  if (type === NotificationType.comment) {
    return (
      <p className="text-sm leading-5 line-clamp-2">
        {name} 回覆了你的主題實踐{practiceName}：<span className="font-semibold">{content}</span>
      </p>
    );
  }

  if (type === NotificationType.followUser) {
    return <p className="text-sm leading-5 truncate">{name} 關注了你</p>;
  }

  if (type === NotificationType.followPractice) {
    return (
      <p className="text-sm leading-5 line-clamp-2">
        {name} 關注了你的主題實踐{practiceName}
      </p>
    );
  }

  if (type === NotificationType.connect) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm leading-5">{name} 對你發出了連結請求</p>
        {connectMessage && (
          <p className="text-sm leading-5 text-text-dark/70 bg-[#F2F7F7] rounded px-2 py-1 line-clamp-2">
            「{connectMessage}」
          </p>
        )}
      </div>
    );
  }

  if (type === NotificationType.agreeConnect) {
    return <p className="text-sm leading-5 truncate">恭喜！{name} 同意了你的連結請求</p>;
  }

  if (type === NotificationType.connectAgree || type === NotificationType.connectRejected) {
    return <p className="text-sm leading-5 truncate">{name} 對你發出了連結請求</p>;
  }

  if (type === NotificationType.updatePracticeCheckin) {
    return (
      <p className="text-sm leading-5 line-clamp-2">
        {name} 更新了主題實踐{practiceName}：<span className="font-semibold">{content}</span>
      </p>
    );
  }

  if (type === NotificationType.updatePracticeFinish) {
    return (
      <p className="text-sm leading-5 line-clamp-2">
        {name} 完成了主題實踐{practiceName}
      </p>
    );
  }

  return null;
}

// ============================================================================
// Helper: right action element
// ============================================================================

function NotificationRightAction({
  notification,
  onConnectAgree,
  onConnectReject,
}: {
  notification: INotificationData;
  onConnectAgree?: (id: string) => void;
  onConnectReject?: (id: string) => void;
}) {
  const { type, id } = notification;

  if (type === NotificationType.connect) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full size-10 bg-[#E4EAE9] hover:bg-[#d0d8d7]"
            aria-label="更多選項"
          >
            <MoreSvg className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onConnectAgree?.(id)}>同意連結</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onConnectReject?.(id)}>忽略</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (type === NotificationType.connectAgree) {
    return (
      <div className="flex items-center gap-1 shrink-0 text-sm text-text-dark px-2">
        <span>已同意</span>
        <Check className="size-5" />
      </div>
    );
  }

  if (type === NotificationType.connectRejected) {
    return (
      <div className="flex items-center gap-1 shrink-0 text-sm text-text-dark px-2">
        <span>已忽略</span>
        <X className="size-5" />
      </div>
    );
  }

  return <ArrowRightOutlineSvg className="shrink-0 size-6 text-text-dark" />;
}

// ============================================================================
// Main Component
// ============================================================================

export function NotificationItem({
  notification,
  onConnectAgree,
  onConnectReject,
  onClick,
}: NotificationItemProps) {
  const { actor, time, isRead } = notification;

  const isClickable =
    notification.type !== NotificationType.connect &&
    notification.type !== NotificationType.connectAgree &&
    notification.type !== NotificationType.connectRejected;

  const handleClick = () => {
    if (isClickable) {
      onClick?.(notification);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(notification);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role is conditionally set to "button" when the notification is clickable
    <div
      className={cn(
        "relative bg-white rounded flex items-center gap-2 p-3",
        isClickable && "cursor-pointer hover:bg-gray-50 transition-colors"
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* 未讀橘點 badge */}
      {!isRead && <div className="absolute left-3 top-3.5 size-1.5 rounded-full bg-[#FF6E0B]" />}

      {/* 頭像 */}
      {actor.id ? (
        <CustomLink
          href={`/users/${actor.id}`}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="size-[60px]">
            {actor.photoURL && <AvatarImage src={actor.photoURL} alt={actor.name} />}
            <AvatarFallback
              className={cn("text-base font-medium text-text-dark", getAvatarColor(actor.name))}
            >
              {actor.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </CustomLink>
      ) : (
        <Avatar className="size-[60px] shrink-0">
          {actor.photoURL && <AvatarImage src={actor.photoURL} alt={actor.name} />}
          <AvatarFallback
            className={cn("text-base font-medium text-text-dark", getAvatarColor(actor.name))}
          >
            {actor.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* 文字區塊 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 text-text-dark">
        <NotificationText notification={notification} />
        <p className="text-sm leading-5 text-text-dark/60">{time}</p>
      </div>

      {/* 右側動作 */}
      <NotificationRightAction
        notification={notification}
        onConnectAgree={onConnectAgree}
        onConnectReject={onConnectReject}
      />
    </div>
  );
}
