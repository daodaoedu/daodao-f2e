"use client";

import { useTranslations } from "@daodao/i18n";
import { ChatRoomList } from "@/components/chat/chat-room-list";

export default function MessagesPage() {
  const t = useTranslations("messages");
  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-4 pt-[68px] md:pt-8 pb-[72px]">
      <h1 className="text-xl font-semibold text-text-dark mb-4">{t("title")}</h1>
      <ChatRoomList />
    </div>
  );
}
