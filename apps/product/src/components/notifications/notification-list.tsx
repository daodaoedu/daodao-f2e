"use client";

import { useState } from "react";
import { NotificationItem } from "./notification-item";
import type { INotificationData } from "./notification-item";
import { NotificationType } from "@/constants/notification-type";

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_NOTIFICATIONS: INotificationData[] = [
  // ── 最新 ──
  {
    id: "1",
    type: NotificationType.updatePracticeCheckin,
    actor: { name: "Vincent", photoURL: undefined },
    practice: { id: "p1", name: "練習寫小說" },
    content: "今天在 Blog 上更新了一小篇，有得到一些回應",
    time: "剛剛",
    isRead: false,
  },
  {
    id: "2",
    type: NotificationType.connect,
    actor: { name: "Vincent", photoURL: undefined },
    connectMessage: "我們都在練習寫作，想一起互相記錄、彼此督促！",
    time: "1 小時前",
    isRead: false,
  },
  {
    id: "3",
    type: NotificationType.reaction,
    actor: { name: "Sarah", photoURL: undefined },
    practice: { id: "p2", name: "每日閱讀 30 分鐘" },
    reaction: "🙌",
    time: "2 小時前",
    isRead: false,
  },
  {
    id: "4",
    type: NotificationType.comment,
    actor: { name: "Alex", photoURL: undefined },
    practice: { id: "p2", name: "每日閱讀 30 分鐘" },
    content: "這個方法真的超有效der 我也開始試試看了",
    time: "3 小時前",
    isRead: false,
  },
  // ── 稍早 ──
  {
    id: "5",
    type: NotificationType.followUser,
    actor: { name: "Mei", photoURL: undefined },
    time: "1 天前",
    isRead: true,
  },
  {
    id: "6",
    type: NotificationType.followPractice,
    actor: { name: "Jordan", photoURL: undefined },
    practice: { id: "p2", name: "每日閱讀 30 分鐘" },
    time: "2 天前",
    isRead: true,
  },
  {
    id: "7",
    type: NotificationType.agreeConnect,
    actor: { name: "Chloe", photoURL: undefined },
    time: "2 天前",
    isRead: true,
  },
  {
    id: "8",
    type: NotificationType.connectAgree,
    actor: { name: "Danny", photoURL: undefined },
    time: "3 天前",
    isRead: true,
  },
  {
    id: "9",
    type: NotificationType.connectRejected,
    actor: { name: "Kelly", photoURL: undefined },
    time: "4 天前",
    isRead: true,
  },
  {
    id: "10",
    type: NotificationType.updatePracticeFinish,
    actor: { name: "Tom", photoURL: undefined },
    practice: { id: "p3", name: "練習寫小說" },
    time: "5 天前",
    isRead: true,
  },
];

// ============================================================================
// Section Component
// ============================================================================

interface NotificationSectionProps {
  title: string;
  notifications: INotificationData[];
  onConnectAgree: (id: string) => void;
  onConnectReject: (id: string) => void;
}

function NotificationSection({
  title,
  notifications,
  onConnectAgree,
  onConnectReject,
}: NotificationSectionProps) {
  if (notifications.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm text-text-dark py-2">{title}</p>
      <div className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onConnectAgree={onConnectAgree}
            onConnectReject={onConnectReject}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NotificationList() {
  const [notifications, setNotifications] = useState<INotificationData[]>(MOCK_NOTIFICATIONS);

  const handleConnectAgree = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, type: NotificationType.connectAgree } : n
      )
    );
  };

  const handleConnectReject = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, type: NotificationType.connectRejected } : n
      )
    );
  };

  // 以 isRead 分組：未讀 = 最新，已讀 = 稍早
  const latest = notifications.filter((n) => !n.isRead);
  const earlier = notifications.filter((n) => n.isRead);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-dark/50">
        <p className="text-base">目前沒有通知</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotificationSection
        title="最新"
        notifications={latest}
        onConnectAgree={handleConnectAgree}
        onConnectReject={handleConnectReject}
      />
      <NotificationSection
        title="稍早"
        notifications={earlier}
        onConnectAgree={handleConnectAgree}
        onConnectReject={handleConnectReject}
      />
    </div>
  );
}
